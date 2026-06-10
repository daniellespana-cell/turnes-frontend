-- 🧠 1. ACTUALIZACIÓN DEL ROUTER DE WEBHOOK DE WOMPI
-- Convierte el Webhook de solo "Recargar Saldo" a un enrutador inteligente 
-- que puede comprar Planes o Servicios directamente sin doble paso.

CREATE OR REPLACE FUNCTION handle_wompi_webhook(event_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_type TEXT;
    v_transaction_id TEXT;
    v_status TEXT;
    v_reference TEXT;
    v_amount_in_cents BIGINT;
    v_user_id UUID;
    v_item_type TEXT;
    v_item_id TEXT;
    v_user_exists BOOLEAN;
    ref_parts TEXT[];
BEGIN
    v_event_type := event_data->>'event';
    IF v_event_type != 'transaction.updated' THEN
        RETURN jsonb_build_object('status', 'ignored', 'message', 'Not a transaction update');
    END IF;

    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_status := event_data->'data'->'transaction'->>'status';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_amount_in_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::BIGINT;

    -- Idempotencia estricta
    IF EXISTS (SELECT 1 FROM public.wompi_events WHERE transaction_id = v_transaction_id) THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Already processed');
    END IF;

    -- Guardar evento base
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload, signature)
    VALUES (v_transaction_id, v_reference, v_amount_in_cents, v_status, event_data, 'valid_by_edge_function');

    -- Solo procesar APROBADAS
    IF v_status != 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Transaction not approved');
    END IF;

    -- 🧩 PARSER INTELIGENTE DE REFERENCIA
    -- Nuevos Formatos: 
    -- 1: REF-<UUID>-recharge-wallet-<TIMESTAMP> (Recarga normal)
    -- 2: REF-<UUID>-plan-pro-<TIMESTAMP> (Compra de Plan Pro)
    -- 3: REF-<UUID>-service-verify-<TIMESTAMP> (Compra Verificación)
    -- Legacy: REF-<UUID>-<TIMESTAMP> (Se asume Recarga)

    -- Extraemos el UUID asumiendo que siempre está entre el índice 5 y el 40 (36 chars)
    BEGIN
        v_user_id := substring(v_reference from 5 for 36)::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid Reference Format (UUID parsing)');
    END;

    -- Preparamos usuario si no existe
    SELECT EXISTS(SELECT 1 FROM public.billeteras WHERE id = v_user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_user_id, 0, now());
    END IF;

    -- Dividimos el string completo en un array usando guiones
    ref_parts := string_to_array(v_reference, '-');
    
    -- Verificamos si es formato LEGACY (Solo 6 partes totales ej: R-E-F-v_user_id-timestamp)
    -- El UUID partido por guiones genera 5 partes.
    -- REF (1) + UUID (5) + TIMESTAMP (1) = 7 partes total.
    
    IF array_length(ref_parts, 1) = 7 THEN
        v_item_type := 'recharge';
        v_item_id := 'wallet';
    ELSIF array_length(ref_parts, 1) >= 9 THEN
        -- REF (1) + UUID (5) + TYPE (1) + ID (1) + TIMESTAMP (1) = 9 partes total
        -- El TYPE está en la posición 7, el ID en la 8
        v_item_type := ref_parts[7];
        v_item_id := ref_parts[8];
    ELSE
        -- Fallback seguro a recarga por cualquier anomalía
        v_item_type := 'recharge';
        v_item_id := 'wallet';
    END IF;

    -- 🔀 ENRUTADOR DE PROCESAMIENTO (Zero-Trust Security V2)
    IF v_item_type = 'recharge' THEN
        -- Lógica de RECARGA (Acredita fondos)
        UPDATE public.billeteras SET saldo = saldo + (v_amount_in_cents / 100), updated_at = now() WHERE id = v_user_id;
        
        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'DEPOSITO', (v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook', 'item_type', 'recharge'));

    ELSIF v_item_type = 'service' AND v_item_id = 'verify' THEN
        -- 🛑 VULNERABILITY PATCH: Price Tampering Guard
        -- Validar que el pago cubra el costo real del servicio (25,000 COP)
        IF (v_amount_in_cents / 100) < 25000 THEN
            -- Abortar entrega, pero guardar el dinero como recarga para no robarle al usuario
            UPDATE public.billeteras SET saldo = saldo + (v_amount_in_cents / 100), updated_at = now() WHERE id = v_user_id;
            INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
            VALUES (v_user_id, 'DEPOSITO', (v_amount_in_cents / 100), v_reference, 'completado', 
                    jsonb_build_object('wompi_id', v_transaction_id, 'source', 'fraud_fallback', 'alert', 'INSUFFICIENT_FUNDS_FOR_SERVICE'));
            RETURN jsonb_build_object('status', 'error', 'message', 'Fraud Alert: Amount paid is less than service cost. Converted to wallet recharge.');
        END IF;

        -- Compra Directa de VERIFICACIÓN
        UPDATE public.perfiles SET verificado = true, updated_at = now() WHERE id = v_user_id;
        
        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -(v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook_direct_buy', 'item_type', 'service', 'item_id', v_item_id));

    ELSIF v_item_type = 'plan' THEN
        -- 🛑 VULNERABILITY PATCH: Price Tampering Guard
        DECLARE
            v_real_price NUMERIC;
        BEGIN
            SELECT costo_mensual INTO v_real_price FROM public.planes WHERE slug ILIKE v_item_id;
            
            IF NOT FOUND OR (v_amount_in_cents / 100) < v_real_price THEN
                -- Abortar entrega, pero guardar el dinero como recarga
                UPDATE public.billeteras SET saldo = saldo + (v_amount_in_cents / 100), updated_at = now() WHERE id = v_user_id;
                INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
                VALUES (v_user_id, 'DEPOSITO', (v_amount_in_cents / 100), v_reference, 'completado', 
                        jsonb_build_object('wompi_id', v_transaction_id, 'source', 'fraud_fallback', 'alert', 'INSUFFICIENT_FUNDS_FOR_PLAN'));
                RETURN jsonb_build_object('status', 'error', 'message', 'Fraud Alert: Amount paid is less than plan cost. Converted to wallet recharge.');
            END IF;
        END;

        -- Compra Directa de PLAN
        UPDATE public.perfiles SET plan = v_item_id, plan_expires_at = now() + interval '30 days', updated_at = now() WHERE id = v_user_id;

        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -(v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook_direct_buy', 'item_type', 'plan', 'item_id', v_item_id));

    END IF;

    -- Retornamos éxito total
    RETURN jsonb_build_object('status', 'success', 'message', 'Webhook routed correctly', 'type', v_item_type);
END;
$$;
