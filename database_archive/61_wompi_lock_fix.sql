-- 🛡️ DROP BUGGY CONSTRAINT AND IMPLEMENT SENIOR CONCURRENCY LOCK

BEGIN;

-- 1. Eliminar el constraint que está arrojando falsos positivos en Supabase
DROP INDEX IF EXISTS idx_movimientos_wompi_id_unique;

-- 2. Reescribir el Webhook para usar un Lock de Concurrencia (Row-Level Lock)
CREATE OR REPLACE FUNCTION public.handle_wompi_webhook(event_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_event_type TEXT;
    v_transaction_id TEXT;
    v_status TEXT;
    v_reference TEXT;
    v_amount_in_cents BIGINT;
    v_user_id UUID;
    v_user_exists BOOLEAN;
    v_real_amount NUMERIC;
    v_type_code TEXT;
    v_item_type TEXT;
    v_is_already_processed BOOLEAN;
BEGIN
    -- 1. Extraer datos del payload
    v_event_type := event_data->>'event';
    
    IF v_event_type != 'transaction.updated' THEN
        RETURN jsonb_build_object('status', 'ignored', 'message', 'Not a transaction update');
    END IF;

    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_status := event_data->'data'->'transaction'->>'status';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_amount_in_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::BIGINT;
    v_real_amount := v_amount_in_cents / 100.0;

    -- 2. 🔐 LOCK DE CONCURRENCIA (Previene Race Conditions de Wompi)
    -- Upsert del evento inicial para tener una fila que bloquear
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload, signature)
    VALUES (v_transaction_id, v_reference, v_amount_in_cents, v_status, event_data, 'valid_by_edge_function')
    ON CONFLICT (transaction_id) DO NOTHING;

    -- Bloquear la fila para que otros webhooks concurrentes esperen aquí
    SELECT (status = 'APPROVED') INTO v_is_already_processed
    FROM public.wompi_events 
    WHERE transaction_id = v_transaction_id 
    FOR UPDATE;

    IF v_is_already_processed THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Already processed by another concurrent webhook');
    END IF;

    -- Si no estaba procesado, actualizamos el estado con el payload actual
    UPDATE public.wompi_events 
    SET status = v_status, payload = event_data
    WHERE transaction_id = v_transaction_id;

    -- 3. Si la transacción no fue aprobada, terminamos el flujo aquí.
    IF v_status != 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Transaction not approved');
    END IF;

    -- 4. 🎯 PARSER DE UUID A PRUEBA DE BALAS
    BEGIN
        IF v_reference LIKE 'REF-%' THEN
            v_user_id := substring(v_reference from 5 for 36)::UUID;
            v_type_code := substring(v_reference from 42 for 1);
        ELSE
            v_user_id := LEFT(v_reference, 36)::UUID;
            v_type_code := substring(v_reference from 38 for 1);
        END IF;

        v_item_type := CASE 
            WHEN v_type_code = 'S' THEN 'plan'
            WHEN v_type_code = 'V' THEN 'verification'
            ELSE 'recharge' 
        END;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.system_logs (level, component, message, metadata)
        VALUES ('ERROR', 'WOMPI_WEBHOOK', 'Referencia inválida o manipulada', jsonb_build_object('ref', v_reference, 'err', SQLERRM));
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid Reference Format');
    END;
    
    -- 5. Garantizar que la billetera exista
    SELECT EXISTS(SELECT 1 FROM public.billeteras WHERE id = v_user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_user_id, 0, now());
    END IF;

    -- 6. 💰 ENRUTAMIENTO ATÓMICO DEL DINERO
    IF v_item_type = 'recharge' THEN
        UPDATE public.billeteras SET saldo = saldo + v_real_amount, updated_at = now() WHERE id = v_user_id;
        
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'INGRESO', v_real_amount, 'Recarga via Wompi', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'recharge', 'source', 'wompi_webhook'));

    ELSIF v_item_type = 'plan' THEN
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -v_real_amount, 'Pago de Suscripción', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'plan'));

    ELSIF v_item_type = 'verification' THEN
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -v_real_amount, 'Verificación de Perfil', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'verification'));
    END IF;

    RETURN jsonb_build_object('status', 'success', 'user_id', v_user_id, 'amount', v_real_amount, 'type', v_item_type);
END;
$$;

-- Restaurar permisos
REVOKE EXECUTE ON FUNCTION handle_wompi_webhook(JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION handle_wompi_webhook(JSONB) TO service_role;

COMMIT;
