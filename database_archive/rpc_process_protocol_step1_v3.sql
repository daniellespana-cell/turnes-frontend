-- =========================================================================
-- RPC: rpc_process_protocol_step1_v3
-- =========================================================================
-- DESCRIPTION:
-- Procesa el pago del Paso 1 (Desbloqueo de contacto) de forma atómica.
-- A diferencia de la V2, esta versión NO recibe el monto desde el cliente.
-- El monto se calcula internamente usando el motor de precios centralizado.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.rpc_process_protocol_step1_v3(
    p_application_id UUID,
    p_candidate_name TEXT DEFAULT 'Candidato'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
    v_empresa_id_vacante UUID;
    v_monto_a_cobrar NUMERIC;
    v_saldo_actual NUMERIC;
    v_step_actual INTEGER;
    v_is_paid BOOLEAN;
    v_tx_id UUID;
BEGIN
    -- 1. Seguridad: Solo empresas pueden pagar
    v_empresa_id := auth.uid();
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Bloqueo de Control y Autorización estricta (Zero-Trust)
    SELECT p.step, p.is_paid, v.empresa_id 
    INTO v_step_actual, v_is_paid, v_empresa_id_vacante
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id
    FOR UPDATE OF p;

    IF v_empresa_id_vacante IS NULL OR v_empresa_id_vacante != v_empresa_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED_OR_NOT_FOUND';
    END IF;

    IF v_is_paid = TRUE OR v_step_actual >= 1 THEN
        RETURN jsonb_build_object('success', true, 'message', 'ALREADY_PAID');
    END IF;

    -- 3. CALCULO DE PRECIO (Backend Source of Truth)
    v_monto_a_cobrar := public.fn_calculate_hiring_cost(p_application_id);

    -- 4. Verificación de Billetera
    SELECT saldo INTO v_saldo_actual FROM public.billeteras WHERE id = v_empresa_id FOR UPDATE;
    
    IF v_saldo_actual < v_monto_a_cobrar THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- 5. Transacción Atómica
    -- A. Descontar Saldo
    UPDATE public.billeteras 
    SET saldo = saldo - v_monto_a_cobrar, 
        updated_at = now() 
    WHERE id = v_empresa_id;

    -- B. Registrar Movimiento
    INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
    VALUES (
        v_empresa_id, 
        'RETIRO', 
        v_monto_a_cobrar, 
        'completado', 
        'Desbloqueo de contacto: ' || p_candidate_name, 
        'STEP1_PAY_' || p_application_id
    ) RETURNING id INTO v_tx_id;

    -- C. Actualizar Postulación
    UPDATE public.postulaciones
    SET step = 1,
        is_paid = true,
        status = 'chat_abierto', -- Se abre el chat oficialmente
        updated_at = now(),
        protocol_state = jsonb_set(
            COALESCE(protocol_state, '{}'::jsonb), 
            '{payment_step1}', 
            jsonb_build_object(
                'amount', v_monto_a_cobrar, 
                'tx_id', v_tx_id, 
                'timestamp', now()
            )
        )
    WHERE id = p_application_id;

    -- 6. Respuesta
    RETURN jsonb_build_object(
        'success', true,
        'newBalance', v_saldo_actual - v_monto_a_cobrar,
        'amountPaid', v_monto_a_cobrar,
        'txId', v_tx_id
    );
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v3(UUID, TEXT) TO authenticated;
