-- =========================================================================
-- fix_invite_flow.sql
-- OBJETIVO: Reparar el flujo completo Invitación → Chat → Notificación
--
-- BLOQUEOS RESUELTOS:
--   1. rpc_invite_candidate no notificaba al candidato
--   2. rpc_process_protocol_step1_v2 no cambiaba el status a 'chat_abierto'
--      → por lo tanto los triggers de chat y notificación nunca se disparaban
--
-- EJECUTAR EN: Supabase SQL Editor (una sola vez)
-- =========================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- FASE 1: ARREGLAR rpc_invite_candidate
-- Agregar notificación al candidato cuando una empresa lo invita
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_invite_candidate(
    p_vacante_id uuid,
    p_candidato_id uuid
)
RETURNS TABLE (
    id uuid,
    vacante_id uuid,
    user_id uuid,
    status text,
    step int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_propia boolean;
    v_nueva_postulacion_id uuid;
    v_job_title text;
    v_company_name text;
    v_is_new boolean := false;
BEGIN
    -- 1. Verificar Gobernanza: ¿La empresa que llama es dueña de la vacante?
    SELECT EXISTS (
        SELECT 1 FROM public.vacantes v
        WHERE v.id = p_vacante_id AND v.empresa_id = auth.uid() AND v.status = 'activa'
    ) INTO v_empresa_propia;

    IF NOT v_empresa_propia THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: No eres dueño de esta vacante o no está activa.';
    END IF;

    -- 2. Obtener metadata para la notificación
    SELECT v.titulo, e.nombre_comercial 
    INTO v_job_title, v_company_name
    FROM public.vacantes v
    LEFT JOIN public.empresas e ON e.id = v.empresa_id
    WHERE v.id = p_vacante_id;

    -- 3. Asegurar que no haya duplicados (Idempotencia)
    SELECT p.id INTO v_nueva_postulacion_id
    FROM public.postulaciones p
    WHERE p.vacante_id = p_vacante_id AND p.user_id = p_candidato_id;

    IF v_nueva_postulacion_id IS NOT NULL THEN
        -- Ya existe, retornar sin notificar de nuevo
        RETURN QUERY SELECT p.id, p.vacante_id, p.user_id, p.status, p.step 
        FROM public.postulaciones p WHERE p.id = v_nueva_postulacion_id;
        RETURN;
    END IF;

    -- 4. Inserción con Privilegios Elevados (Bypassing RLS)
    INSERT INTO public.postulaciones (
        vacante_id, 
        user_id, 
        status, 
        step,
        protocol_state
    ) VALUES (
        p_vacante_id,
        p_candidato_id,
        'pendiente',
        0,
        jsonb_build_object('is_invitation', true, 'invited_at', now())
    )
    RETURNING postulaciones.id INTO v_nueva_postulacion_id;
    v_is_new := true;

    -- 5. NOTIFICAR AL CANDIDATO: "Una empresa te invitó a una vacante"
    IF v_is_new THEN
        PERFORM public.rpc_create_notification(
            p_candidato_id,
            'INVITE_RECEIVED',
            v_nueva_postulacion_id,
            jsonb_build_object(
                'jobTitle', COALESCE(v_job_title, 'una vacante'),
                'companyName', COALESCE(v_company_name, 'Una empresa')
            )
        );
    END IF;

    -- 6. Retornar los datos insertados
    RETURN QUERY SELECT p.id, p.vacante_id, p.user_id, p.status, p.step 
    FROM public.postulaciones p WHERE p.id = v_nueva_postulacion_id;

END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_invite_candidate(uuid, uuid) TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- FASE 2: ARREGLAR rpc_process_protocol_step1_v2
-- Agregar status = 'chat_abierto' al UPDATE después del pago
-- Esto desbloquea automáticamente:
--   ✅ crear_chat_automatico (trigger que crea fila en turnes_chats)
--   ✅ fn_on_match_notification (trigger que envía MATCH_ESTABLISHED al candidato)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_process_protocol_step1_v2(
    p_application_id uuid,
    p_amount numeric,
    p_concept text
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_vacante_id uuid;
    v_empresa_id uuid;
    v_is_paid boolean;
    v_status text;
    v_billetera billeteras%ROWTYPE;
    v_tx_id uuid;
    v_protocol_state jsonb;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN 
        RAISE EXCEPTION 'UNAUTHORIZED'; 
    END IF;

    -- Forced Timeout Prevention
    SET LOCAL statement_timeout = '15s';
    SET LOCAL lock_timeout = '5s';

    -- 1. Obtener datos de la postulación
    SELECT p.vacante_id, p.is_paid, p.status, p.protocol_state, v.empresa_id 
    INTO v_vacante_id, v_is_paid, v_status, v_protocol_state, v_empresa_id
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'CHAT_NOT_FOUND'; 
    END IF;
    
    IF v_empresa_id != v_user_id THEN 
        RAISE EXCEPTION 'UNAUTHORIZED'; 
    END IF;
    
    -- Manejo de Idempotencia Limpia
    IF v_is_paid = true THEN 
        RETURN jsonb_build_object('success', true, 'alreadyPaid', true); 
    END IF;

    -- 2. BLOQUEO FINANCIERO: Cobrar de la billetera P2P
    SELECT * INTO v_billetera FROM billeteras WHERE id = v_user_id FOR UPDATE;
    
    IF NOT FOUND THEN 
        RAISE EXCEPTION 'WALLET_NOT_FOUND'; 
    END IF;
    
    IF v_billetera.saldo < p_amount THEN 
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; 
    END IF;

    UPDATE billeteras 
    SET saldo = saldo - p_amount, updated_at = now() 
    WHERE id = v_user_id;

    -- 3. AUDITORÍA: Registrar en Movimientos
    INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
    VALUES (v_user_id, 'RETIRO', p_amount, 'completado', p_concept, 'STEP1_PAYMENT:' || p_application_id)
    RETURNING id INTO v_tx_id;

    -- 4. ESTADO: Actualizar la Postulación
    --    🔥 FIX CRÍTICO: Ahora cambiamos status a 'chat_abierto'
    --    Esto dispara automáticamente:
    --      - crear_chat_automatico() → crea fila en turnes_chats
    --      - fn_on_match_notification() → envía MATCH_ESTABLISHED al candidato
    v_protocol_state := COALESCE(v_protocol_state, '{}'::jsonb);
    
    UPDATE postulaciones 
    SET is_paid = true, 
        step = GREATEST(step, 1), 
        status = 'chat_abierto',
        protocol_state = v_protocol_state || jsonb_build_object('step1_paid_at', now()),
        updated_at = now()
    WHERE id = p_application_id;

    -- 5. Finalizar con el JSON de respuesta
    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', v_billetera.saldo - p_amount, 
        'tx_id', v_tx_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v2 TO anon;

COMMIT;

-- =========================================================================
-- RESULTADO ESPERADO:
--
-- ANTES:
--   Empresa invita → status='pendiente' → paga → is_paid=true PERO status='pendiente'
--   → Chat NO se crea → Notificación NO se envía → Candidato no ve nada
--
-- DESPUÉS:
--   Empresa invita → status='pendiente' + notificación INVITE_RECEIVED al candidato
--   → Empresa paga → status='chat_abierto' 
--   → Trigger crea chat en turnes_chats ✅
--   → Trigger envía MATCH_ESTABLISHED al candidato ✅
--   → Candidato ve notificación + chat aparece en su lista ✅
-- =========================================================================
