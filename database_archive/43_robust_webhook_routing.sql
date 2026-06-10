-- ============================================================
-- TURNES: CLEAN WEBHOOK (REMOVED WORKER VERIFICATION)
-- Mantiene recargas, planes y verificación de EMPRESA.
-- Eliminada toda lógica de verificación para Postulantes.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_wompi_webhook(event_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id TEXT;
    v_status TEXT;
    v_reference TEXT;
    v_amount_in_cents BIGINT;
    v_user_id UUID;
    v_amount_cop NUMERIC;
    v_user_role TEXT;
    v_concept TEXT;
BEGIN
    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_status := event_data->'data'->'transaction'->>'status';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_amount_in_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::BIGINT;
    v_amount_cop := v_amount_in_cents / 100;

    -- 1. Registro del Evento
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload)
    VALUES (v_transaction_id, v_reference, v_amount_in_cents, v_status, event_data)
    ON CONFLICT (transaction_id) DO UPDATE SET status = v_status, payload = event_data;

    -- 2. Solo procesar si es APPROVED
    IF v_status != 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Processed non-approved status');
    END IF;

    -- 3. Extraer User ID
    v_user_id := (substring(v_reference from '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'))::UUID;
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'No user UUID found');
    END IF;

    -- 4. Obtener Rol
    SELECT rol::text INTO v_user_role FROM public.perfiles WHERE id = v_user_id;

    -- 5. Lógica Determinista Limpia
    IF v_reference LIKE '%-R-%' THEN
        -- 💰 RECARGA DE SALDO
        v_concept := 'Recarga de Saldo';
    ELSIF v_reference LIKE '%-unlock-%' THEN
        -- 🔓 DESBLOQUEO DE CONTACTO (Empresas)
        v_concept := 'Desbloqueo de contacto';
    ELSIF (v_reference LIKE '%-V-%' OR v_reference LIKE '%-verify-%') AND v_user_role = 'empresa' THEN
        -- ✅ VERIFICACIÓN EMPRESA (Se mantiene)
        v_concept := 'Pago de Servicio';
        -- La lógica de aprobación de empresa puede ir aquí si es automática
    ELSIF v_reference LIKE '%-P-%' OR v_reference LIKE '%-plan-%' THEN
        -- 💎 PLAN (Empresas)
        v_concept := 'Pago de Servicio';
        UPDATE public.perfiles SET plan = 'pro', plan_expires_at = now() + interval '30 days' WHERE id = v_user_id;
    ELSE
        -- FALLBACK
        v_concept := 'Pago de Servicio';
    END IF;

    -- 6. LIMPIEZA DE MOVIMIENTOS PREVIOS
    DELETE FROM public.movimientos WHERE metadata->>'wompi_id' = v_transaction_id;

    -- 7. Registro de Movimiento
    IF v_concept = 'Recarga de Saldo' THEN
        UPDATE public.billeteras SET saldo = saldo + v_amount_cop WHERE id = v_user_id;
        
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'DEPOSITO', v_amount_cop, v_concept, v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'item_type', 'recharge'));
    ELSE
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -v_amount_cop, v_concept, v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'item_type', 'service'));
    END IF;

    RETURN jsonb_build_object('status', 'success', 'concept', v_concept);
END;
$$;
