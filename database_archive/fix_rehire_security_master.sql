-- =========================================================================
-- fix_rehire_security_master.sql (V3 - Final Fix)
-- AUDITORÍA QUIRÚRGICA: Blindaje, Reembolsos y Corrección de Esquema
-- =========================================================================

BEGIN;

-- 1. 🗑️ LIMPIEZA DE DEUDA
DROP FUNCTION IF EXISTS public.rpc_rehire_fast_track(UUID, NUMERIC, TEXT, NUMERIC);
DROP FUNCTION IF EXISTS public.rpc_decline_rehire_offer(UUID, UUID);

-- 2. 🚀 REFACTOR: LANZAR OFERTA DE RECONTRATACIÓN (FIX SCHEMA)
CREATE OR REPLACE FUNCTION public.rpc_launch_rehire_offer(
    p_candidato_id UUID,
    p_offer_amount NUMERIC,
    p_offer_date TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
    v_plan_id UUID;
    v_pct_comision NUMERIC;
    v_monto_comision NUMERIC;
    v_saldo_actual NUMERIC;
    v_nueva_vacante_id UUID;
    v_nueva_postulacion_id UUID;
    v_company_name TEXT;
    v_job_title TEXT;
BEGIN
    v_empresa_id := auth.uid();
    
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Seguridad: Validar que la oferta sea realista (Evitar salarios/comisiones negativas)
    IF p_offer_amount < 50000 THEN
        RAISE EXCEPTION 'OFFER_AMOUNT_TOO_LOW';
    END IF;

    -- A. Calcular comisión basada en PLAN
    SELECT e.plan_id, e.nombre_comercial INTO v_plan_id, v_company_name
    FROM public.empresas e WHERE e.id = v_empresa_id;

    SELECT COALESCE(comision_turnos_pct, 10.0) INTO v_pct_comision
    FROM public.planes 
    WHERE id = v_plan_id OR (v_plan_id IS NULL AND nombre = 'Gratuito')
    LIMIT 1;

    v_monto_comision := p_offer_amount * (v_pct_comision / 100.0);

    -- Validar Saldo
    SELECT saldo INTO v_saldo_actual FROM public.billeteras WHERE id = v_empresa_id FOR UPDATE;
    IF v_saldo_actual < v_monto_comision THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- B. Escrow: Cobro Inmediato
    IF v_monto_comision > 0 THEN
        UPDATE public.billeteras SET saldo = saldo - v_monto_comision, updated_at = now() WHERE id = v_empresa_id;
        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
        VALUES (v_empresa_id, 'RETIRO', v_monto_comision, 'completado', 'Comisión Recontratación Directa', 'REHIRE_ESCROW_' || extract(epoch from now()));
    END IF;

    -- C. Crear Vacante (FIX: Sin columna is_active)
    SELECT v.titulo INTO v_job_title FROM public.postulaciones p JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE v.empresa_id = v_empresa_id AND p.user_id = p_candidato_id ORDER BY p.created_at DESC LIMIT 1;

    INSERT INTO public.vacantes (empresa_id, titulo, descripcion, pago_monto, fecha_turno, tipo_turno, status)
    VALUES (v_empresa_id, 'RECONTRATACIÓN: ' || COALESCE(v_job_title, 'Turno Directo'), 'Oferta Directa vía Mis Favoritos', p_offer_amount, p_offer_date::DATE, 'Directo', 'cerrada')
    RETURNING id INTO v_nueva_vacante_id;

    -- D. Crear Postulación (Paso 1 Completado)
    INSERT INTO public.postulaciones (vacante_id, user_id, status, step, is_paid, protocol_state)
    VALUES (v_nueva_vacante_id, p_candidato_id, 'pendiente', 1, true, 
        jsonb_build_object('is_rehire', true, 'commission_paid', v_monto_comision, 'offer_amount', p_offer_amount, 'offer_date', p_offer_date))
    RETURNING id INTO v_nueva_postulacion_id;

    -- E. Notificar y Mensaje
    PERFORM public.rpc_create_notification(p_candidato_id, 'REHIRE_OFFER_RECEIVED', v_nueva_postulacion_id, 
        jsonb_build_object('companyName', COALESCE(v_company_name, 'Una empresa'), 'jobTitle', COALESCE(v_job_title, 'un turno')));

    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (v_nueva_postulacion_id, v_empresa_id, 'Te han enviado una oferta de recontratación directa.', 'rehire_offer', 
        jsonb_build_object('subtype', 'rehire_offer', 'price', p_offer_amount, 'date', p_offer_date, 'status', 'pending'));

    RETURN jsonb_build_object('success', true, 'chat_id', v_nueva_postulacion_id);
END;
$$;


-- 3. ✅ REFACTOR: ACEPTAR OFERTA (Pasar al Paso 2)
CREATE OR REPLACE FUNCTION public.rpc_accept_rehire_offer(
    p_mensaje_id UUID,
    p_postulacion_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_empresa_id UUID;
    v_candidate_name TEXT;
    v_current_status TEXT;
BEGIN
    v_user_id := auth.uid();

    -- Bloqueo FOR UPDATE para prevenir ataques de concurrencia
    SELECT p.status INTO v_current_status
    FROM public.postulaciones p 
    WHERE p.id = p_postulacion_id AND p.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED_OR_NOT_FOUND';
    END IF;

    -- Integridad de Estado: Solo se puede aceptar si está pendiente
    IF v_current_status != 'pendiente' THEN
        RETURN jsonb_build_object('success', false, 'message', 'OFFER_NOT_PENDING');
    END IF;

    UPDATE public.mensajes SET metadata = jsonb_set(metadata, '{status}', '"accepted"') WHERE id = p_mensaje_id;

    -- 🔥 POLÍTICA: Se pasa al Paso 2 (Validación)
    UPDATE public.postulaciones SET step = 2, status = 'chat_abierto', updated_at = now() WHERE id = p_postulacion_id;

    SELECT v.empresa_id, p.nombre_display INTO v_empresa_id, v_candidate_name
    FROM public.postulaciones post JOIN public.vacantes v ON v.id = post.vacante_id JOIN public.perfiles p ON p.id = post.user_id
    WHERE post.id = p_postulacion_id;

    PERFORM public.rpc_create_notification(v_empresa_id, 'MATCH_ESTABLISHED', p_postulacion_id, jsonb_build_object('candidateName', v_candidate_name));

    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (p_postulacion_id, v_user_id, '¡Oferta aceptada! El proceso avanza a validación.', 'system_info', jsonb_build_object('subtype', 'rehire_accepted'));

    RETURN jsonb_build_object('success', true);
END;
$$;


-- 4. ↩️ REFACTOR: DECLINAR OFERTA (REEMBOLSO AUTOMÁTICO)
CREATE OR REPLACE FUNCTION public.rpc_decline_rehire_offer(
    p_mensaje_id UUID,
    p_postulacion_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_empresa_id UUID;
    v_comision NUMERIC;
    v_protocol_state JSONB;
    v_current_status TEXT;
BEGIN
    v_user_id := auth.uid();
    
    -- Bloqueo FOR UPDATE para prevenir ataques de concurrencia (Race Conditions y Reembolso Múltiple)
    SELECT p.protocol_state, v.empresa_id, p.status
    INTO v_protocol_state, v_empresa_id, v_current_status
    FROM public.postulaciones p 
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_postulacion_id AND p.user_id = v_user_id
    FOR UPDATE OF p;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED_OR_NOT_FOUND'; END IF;

    -- Integridad de Estado: Solo se puede declinar si está pendiente
    IF v_current_status != 'pendiente' THEN
        RETURN jsonb_build_object('success', false, 'message', 'OFFER_ALREADY_PROCESSED');
    END IF;

    -- 1. Marcar como rechazado
    UPDATE public.mensajes SET metadata = jsonb_set(metadata, '{status}', '"declined"') WHERE id = p_mensaje_id;
    UPDATE public.postulaciones SET status = 'rechazado', updated_at = now() WHERE id = p_postulacion_id;

    -- 💰 2. REEMBOLSO AUTOMÁTICO
    v_comision := COALESCE((v_protocol_state->>'commission_paid')::NUMERIC, 0);
    IF v_comision > 0 THEN
        UPDATE public.billeteras SET saldo = saldo + v_comision, updated_at = now() WHERE id = v_empresa_id;
        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
        VALUES (v_empresa_id, 'DEPOSITO', v_comision, 'completado', 'Reembolso: Oferta Recontratación Declinada', 'REHIRE_REFUND_' || p_postulacion_id);
    END IF;

    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (p_postulacion_id, v_user_id, 'El talento ha declinado la oferta. El monto de la comisión fue reembolsado a tu billetera.', 'system_info', jsonb_build_object('subtype', 'rehire_declined'));

    RETURN jsonb_build_object('success', true, 'refund_amount', v_comision);
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_launch_rehire_offer(UUID, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_accept_rehire_offer(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_decline_rehire_offer(UUID, UUID) TO authenticated;

COMMIT;
