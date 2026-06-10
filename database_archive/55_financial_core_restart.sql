-- 🕸️ TURNES FINANCIAL CORE (VERSION 5.0 - ZERO DEBT)
-- Objetivo: Garantizar la integridad atómica de los pagos y la reactividad del saldo.

BEGIN;

-- 1. 🛡️ TABLA DE EVENTOS (Asegurar Unicidad)
-- Si no tiene el constraint de unicidad, el sistema podría duplicar dinero.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wompi_events_transaction_id_key') THEN
        ALTER TABLE public.wompi_events ADD CONSTRAINT wompi_events_transaction_id_key UNIQUE (transaction_id);
    END IF;
END $$;

-- 2. 🧠 EL CEREBRO: Webhook con Parser de Precisión
CREATE OR REPLACE FUNCTION public.handle_wompi_webhook(event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_transaction_id text;
    v_reference text;
    v_status text;
    v_amount_cents bigint;
    v_user_id uuid;
    v_type_code text;
    v_item_type text;
    v_real_amount numeric;
BEGIN
    -- 1. Extracción de datos básicos
    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_status := event_data->'data'->'transaction'->>'status';
    v_amount_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::bigint;
    v_real_amount := v_amount_cents / 100.0;

    -- 2. Idempotencia: ¿Ya procesamos este transaction_id?
    IF EXISTS (SELECT 1 FROM public.wompi_events WHERE transaction_id = v_transaction_id AND status = 'APPROVED') THEN
        RETURN jsonb_build_object('status', 'ignored', 'message', 'Transacción ya procesada');
    END IF;

    -- 3. Registro del evento (Auditoría)
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload)
    VALUES (v_transaction_id, v_reference, v_amount_cents, v_status, event_data)
    ON CONFLICT (transaction_id) DO UPDATE SET status = EXCLUDED.status, payload = EXCLUDED.payload;

    -- 4. Si no está aprobado, terminamos
    IF v_status <> 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'logged', 'action', 'none');
    END IF;

    -- 5. 🎯 PARSER DE PRECISIÓN (UUID-TIPO-TIMESTAMP)
    -- El UUID siempre mide 36 caracteres.
    BEGIN
        v_user_id := LEFT(v_reference, 36)::UUID;
        v_type_code := SUBSTRING(v_reference, 38, 1); -- El código de tipo está después del UUID y un guión
        
        v_item_type := CASE 
            WHEN v_type_code = 'R' THEN 'recharge'
            WHEN v_type_code = 'S' THEN 'plan'
            WHEN v_type_code = 'V' THEN 'verification'
            ELSE 'unknown'
        END;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.system_logs (level, component, message, metadata)
        VALUES ('ERROR', 'FINANCE_PARSER', 'Error parseando referencia', jsonb_build_object('ref', v_reference, 'err', SQLERRM));
        RETURN jsonb_build_object('status', 'error', 'message', 'Referencia corrupta');
    END;

    -- 6. 💸 ENRUTAMIENTO ATÓMICO
    
    -- CASO A: RECARGAS (R)
    IF v_item_type = 'recharge' THEN
        -- Actualizar Saldo
        UPDATE public.billeteras SET saldo = saldo + v_real_amount, updated_at = now() WHERE id = v_user_id;

        -- Insertar Movimiento (SSOT para la UI)
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'INGRESO', v_real_amount, 'Recarga via Wompi', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'recharge'));

    -- CASO B: PLANES (S)
    ELSIF v_item_type = 'plan' THEN
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -v_real_amount, 'Pago de Suscripción Pro', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'plan'));
        -- Aquí podrías actualizar el plan en perfiles si fuera necesario.

    -- CASO C: VERIFICACIÓN (V)
    ELSIF v_item_type = 'verification' THEN
        INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -v_real_amount, 'Verificación de Identidad', v_transaction_id, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'type', 'verification'));
    END IF;

    -- 7. Heartbeat para el Frontend (Trigger opcional de Realtime)
    -- Supabase enviará el cambio automáticamente por Realtime a la tabla movimientos.

    RETURN jsonb_build_object('status', 'success', 'user_id', v_user_id, 'amount', v_real_amount);
END;
$$;

COMMIT;
