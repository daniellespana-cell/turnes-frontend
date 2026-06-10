-- 🛡️ rpc_process_protocol_step1_v2.sql
-- Ejecuta el pago de desbloqueo de postulación y pasa al Step 1.
-- Sigue la estricta arquitectura financiera de Turnes.
-- V2: ANTI-DEADLOCK IMPLEMENTATION (Forced timeouts to prevent UI hangs)

BEGIN;

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

    -- Forced Timeout Prevention: We drop the statement_timeout for this specific transaction
    -- to allow it to power through any pending table locks and avoid the infinite "Procesando..." loader.
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
    -- Utilizamos SKIP LOCKED si es necesario, pero lock_timeout debería ser suficiente para fallar rápido
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

    -- 3. AUDITORÍA: Registrar en Movimientos usando tipos autorizados
    INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
    VALUES (v_user_id, 'RETIRO', p_amount, 'completado', p_concept, 'STEP1_PAYMENT:' || p_application_id)
    RETURNING id INTO v_tx_id;

    -- 4. ESTADO: Actualizar la Postulación
    v_protocol_state := COALESCE(v_protocol_state, '{}'::jsonb);
    
    UPDATE postulaciones 
    SET is_paid = true, 
        step = GREATEST(step, 1), 
        protocol_state = v_protocol_state || jsonb_build_object('step1_paid_at', now()),
        updated_at = now()
    WHERE id = p_application_id;

    -- 5. Finalizar con el JSON de respuesta esperado por el Frontend
    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', v_billetera.saldo - p_amount, 
        'tx_id', v_tx_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar Privilegios Globales 
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v2 TO anon;

COMMIT;
