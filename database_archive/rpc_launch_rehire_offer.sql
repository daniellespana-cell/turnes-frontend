-- =========================================================================
-- SCRIPT: RECONTRATACIÓN DIRECTA (MIS FAVORITOS)
-- =========================================================================
-- Evitar que el frontend invente actualizaciones de estado que rompen el historial
-- Este RPC clona la última vacante conocida, le asigna pago y cobra comisión nativamente.

CREATE OR REPLACE FUNCTION rpc_launch_rehire_offer(
    p_candidato_id UUID,
    p_offer_amount NUMERIC,
    p_offer_date TEXT,
    p_comision NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
    v_saldo_actual NUMERIC;
    v_ultima_vacante_id UUID;
    v_nueva_vacante_id UUID;
    v_nueva_postulacion_id UUID;
BEGIN
    v_empresa_id := auth.uid();
    
    -- 1. Validar Identidad y Saldo
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Validar tabla de billeteras (Asegurarse de que exista)
    IF NOT EXISTS (SELECT 1 FROM public.billeteras WHERE id = v_empresa_id) THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_empresa_id, 0, now());
    END IF;

    SELECT saldo INTO v_saldo_actual FROM public.billeteras WHERE id = v_empresa_id;

    IF v_saldo_actual < p_comision THEN
        RAISE EXCEPTION 'SALDO_INSUFICIENTE';
    END IF;

    -- 2. Descontar y Registrar Comisión (Si aplica)
    IF p_comision > 0 THEN
        UPDATE public.billeteras 
        SET saldo = saldo - p_comision, updated_at = now()
        WHERE id = v_empresa_id;

        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, referencia)
        VALUES (v_empresa_id, 'RETIRO', p_comision, 'completado', 'COMISION_REHIRE_' || extract(epoch from now()));
    END IF;

    -- 3. Identificar última vacante para heredar lat/lng/requisitos
    SELECT p.vacante_id INTO v_ultima_vacante_id
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE v.empresa_id = v_empresa_id AND p.user_id = p_candidato_id
    ORDER BY p.created_at DESC
    LIMIT 1;

    IF v_ultima_vacante_id IS NULL THEN
        RAISE EXCEPTION 'NO_PREVIOUS_HISTORY';
    END IF;

    -- 4. Crear Vacante Privada (Clonada) con esquema V2
    INSERT INTO public.vacantes (
        empresa_id, titulo, descripcion, salario, pago_monto, 
        fecha_turno, tipo_turno, status, lat, lng
    )
    SELECT 
        empresa_id, 'OF. DIRECTA: ' || titulo, 'Oferta Privada (Recontratación)', 
        p_offer_amount, p_offer_amount, -- Inyectamos el salario real en ambas para seguridad
        p_offer_date::timestamptz, 'Directo', 'cerrada'::public.estado_vacante_enum, lat, lng
    FROM public.vacantes
    WHERE id = v_ultima_vacante_id
    RETURNING id INTO v_nueva_vacante_id;

    -- 5. Crear Nueva Postulación (Directo a Chat)
    INSERT INTO public.postulaciones (vacante_id, user_id, status, step, is_paid, protocol_state)
    VALUES (v_nueva_vacante_id, p_candidato_id, 'agendado', 0, true, '{"winner_takes_all": true, "rehire": true}'::jsonb)
    RETURNING id INTO v_nueva_postulacion_id;

    -- 6. Inyectar Mensaje de Sistema al Chat (Notificará en Tiempo Real)
    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (v_nueva_postulacion_id, v_empresa_id, 'Propuesta de Recontratación Enviada', 'system', jsonb_build_object(
        'intent', 'RECONTRATACION_DIRECTA',
        'price', p_offer_amount,
        'date', p_offer_date,
        'status', 'pending'
    ));

    RETURN jsonb_build_object('success', true, 'chat_id', v_nueva_postulacion_id);
END;
$$;
