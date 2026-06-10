-- 🧱 MASTER FIX PARA WOMPI WEBHOOK (SSOT)
-- Resuelve la validación de UUID y elimina cualquier riesgo de infinite loop.

BEGIN;

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

    -- 2. Idempotencia: No procesar si ya se procesó con éxito
    IF EXISTS (SELECT 1 FROM public.wompi_events WHERE transaction_id = v_transaction_id AND status = 'APPROVED') THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Already processed');
    END IF;

    -- 3. Auditoría Cruda: Guardar el evento tal cual llega
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload, signature)
    VALUES (v_transaction_id, v_reference, v_amount_in_cents, v_status, event_data, 'valid_by_edge_function')
    ON CONFLICT (transaction_id) DO UPDATE SET status = EXCLUDED.status, payload = EXCLUDED.payload;

    -- 4. Si la transacción fue rechazada por saldo u otra cosa, no damos el servicio.
    IF v_status != 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Transaction not approved');
    END IF;

    -- 5. 🎯 PARSER DE UUID A PRUEBA DE BALAS
    -- El frontend envía algo como: 0d03efbf-647b-467f-83df-4350337d62a7-R-1780455897525
    -- O a veces podría enviar: REF-0d03efbf-647b-467f-83df-4350337d62a7-...
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
            ELSE 'recharge' -- Por defecto 'R'
        END;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.system_logs (level, component, message, metadata)
        VALUES ('ERROR', 'WOMPI_WEBHOOK', 'Referencia inválida o manipulada', jsonb_build_object('ref', v_reference, 'err', SQLERRM));
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid Reference Format');
    END;
    
    -- 6. Garantizar que la billetera exista
    SELECT EXISTS(SELECT 1 FROM public.billeteras WHERE id = v_user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_user_id, 0, now());
    END IF;

    -- 7. 💰 ENRUTAMIENTO ATÓMICO DEL DINERO
    IF v_item_type = 'recharge' THEN
        -- Sumar saldo
        UPDATE public.billeteras SET saldo = saldo + v_real_amount, updated_at = now() WHERE id = v_user_id;
        
        -- Mover a historial
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
