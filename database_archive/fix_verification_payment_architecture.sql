-- ============================================================
-- TURNES: MASTER ARCHITECTURE FIX FOR VERIFICATION PAYMENTS
-- Cierra las brechas de doble cobro y verificación mágica
-- ============================================================

BEGIN;

-- 0. ACTUALIZAR CONSTRAINT DE ESTADOS (Añadir payment_cleared)
ALTER TABLE public.verification_requests DROP CONSTRAINT IF EXISTS verification_requests_status_check;
ALTER TABLE public.verification_requests ADD CONSTRAINT verification_requests_status_check 
CHECK (status IN ('payment_cleared', 'pending', 'in_review', 'approved', 'rejected'));

-- 1. FIX: Webhook de Wompi (update_wompi_webhook_routing)
-- Bloquear verificado=true para el servicio verify. En su lugar, emitir token.
-- ─────────────────────────────────────────────────────────────

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
    v_user_role VARCHAR(20);
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

    BEGIN
        v_user_id := substring(v_reference from 5 for 36)::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid Reference Format (UUID parsing)');
    END;

    -- Preparamos usuario y obtenemos rol
    SELECT EXISTS(SELECT 1 FROM public.billeteras WHERE id = v_user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_user_id, 0, now());
    END IF;

    SELECT rol INTO v_user_role FROM public.perfiles WHERE id = v_user_id;
    IF v_user_role IS NULL THEN
        -- Fallback de seguridad en caso excepcional
        v_user_role := 'empresa';
    END IF;

    ref_parts := string_to_array(v_reference, '-');
    
    IF array_length(ref_parts, 1) = 7 THEN
        v_item_type := 'recharge';
        v_item_id := 'wallet';
    ELSIF array_length(ref_parts, 1) >= 9 THEN
        v_item_type := ref_parts[7];
        v_item_id := ref_parts[8];
    ELSE
        v_item_type := 'recharge';
        v_item_id := 'wallet';
    END IF;

    -- 🔀 ENRUTADOR DE PROCESAMIENTO
    IF v_item_type = 'recharge' THEN
        UPDATE public.billeteras SET saldo = saldo + (v_amount_in_cents / 100), updated_at = now() WHERE id = v_user_id;
        
        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'DEPOSITO', (v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook', 'item_type', 'recharge'));

    ELSIF v_item_type = 'service' AND v_item_id = 'verify' THEN
        -- 🛑 FIX: NO DAR VERIFICACIÓN. Generar Request de Verificación Pre-Pagado.
        INSERT INTO public.verification_requests (user_id, user_role, status, documents)
        VALUES (v_user_id, v_user_role, 'payment_cleared', '{}');

        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -(v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook_direct_buy', 'item_type', 'service', 'item_id', v_item_id));

        INSERT INTO notificaciones (user_id, tipo, mensaje)
        VALUES (v_user_id, 'VERIFICATION_PAID', 'Tu pago por Verificación fue aprobado. Por favor, sube tus documentos.');

    ELSIF v_item_type = 'plan' THEN
        UPDATE public.perfiles SET plan = v_item_id, plan_expires_at = now() + interval '30 days', updated_at = now() WHERE id = v_user_id;

        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
        VALUES (v_user_id, 'PAGO_SERVICIO', -(v_amount_in_cents / 100), v_reference, 'completado', 
                jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook_direct_buy', 'item_type', 'plan', 'item_id', v_item_id));
    END IF;

    RETURN jsonb_build_object('status', 'success', 'message', 'Webhook routed correctly', 'type', v_item_type);
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 2. FIX: Wallet Payment RPC (rpc_procesar_pago_wallet_v2)
-- Bloquear verificado=true para el servicio verify.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_procesar_pago_wallet_v2(
    p_item_id text,
    p_item_type text,
    p_monto numeric,
    p_concepto text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_perfil record;
    v_wallet record;
    v_new_balance numeric;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

    SELECT * INTO v_perfil FROM perfiles WHERE id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'USER_NOT_FOUND'; END IF;

    SELECT * INTO v_wallet FROM billeteras WHERE id = v_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'WALLET_NOT_FOUND'; END IF;

    IF v_wallet.saldo < p_monto THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
    v_new_balance := v_wallet.saldo - p_monto;

    -- PROTECCIÓN SEGÚN TIPO DE ÍTEM
    IF p_item_type = 'service' AND p_item_id = 'verify' THEN
        IF v_perfil.verificado = true THEN
            RAISE EXCEPTION 'ALREADY_VERIFIED';
        END IF;

        IF EXISTS (SELECT 1 FROM verification_requests WHERE user_id = v_user_id AND status IN ('pending', 'in_review', 'payment_cleared')) THEN
            RAISE EXCEPTION 'ALREADY_PENDING_OR_PAID';
        END IF;

        UPDATE billeteras SET saldo = v_new_balance WHERE id = v_user_id;

        INSERT INTO movimientos (billetera_id, tipo, monto, concepto)
        VALUES (v_user_id, 'PAGO_SERVICIO', -p_monto, p_concepto);

        -- 🛑 FIX: Crear request en estado payment_cleared. NO OTORGAR verificado = true
        INSERT INTO verification_requests (user_id, user_role, status, documents)
        VALUES (v_user_id, v_perfil.rol, 'payment_cleared', '{}');

    ELSIF p_item_type = 'plan' THEN
        UPDATE billeteras SET saldo = v_new_balance WHERE id = v_user_id;

        INSERT INTO movimientos (billetera_id, tipo, monto, concepto)
        VALUES (v_user_id, 'PAGO_SERVICIO', -p_monto, p_concepto);

        UPDATE perfiles SET plan = p_item_id, plan_expires_at = NOW() + INTERVAL '30 days', updated_at = NOW() WHERE id = v_user_id;

    ELSE
        RAISE EXCEPTION 'INVALID_ITEM_TYPE';
    END IF;

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'type', p_item_type);
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 3. FIX: Admin Verification Flow (rpc_request_verification)
-- Recibe documentos y los anexa a la fila pre-pagada. No cobra $20,000 extra.
-- ─────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.rpc_request_verification(jsonb);

CREATE OR REPLACE FUNCTION rpc_request_verification(docs jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id       UUID;
    v_req_id        UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

    -- Verificar que NO esté verificado
    IF EXISTS (SELECT 1 FROM perfiles WHERE id = v_user_id AND verificado = true) THEN
        RAISE EXCEPTION 'ALREADY_VERIFIED: Tu cuenta ya está verificada.';
    END IF;

    -- 🛑 Verificar que EXISTE el token pre-pagado
    SELECT id INTO v_req_id FROM verification_requests 
    WHERE user_id = v_user_id AND status = 'payment_cleared' 
    LIMIT 1;

    IF v_req_id IS NULL THEN
        -- Puede que ya esté revisándose
        IF EXISTS (SELECT 1 FROM verification_requests WHERE user_id = v_user_id AND status IN ('pending', 'in_review')) THEN
             RAISE EXCEPTION 'ALREADY_SUBMITTED: Tus documentos ya están en revisión.';
        END IF;

        RAISE EXCEPTION 'PAYMENT_REQUIRED: No has pagado por la verificación o la transacción no se ha acreditado.';
    END IF;

    -- Actualiza el estado a pendiente y anexa documentos
    UPDATE verification_requests 
    SET documents = docs, status = 'pending', updated_at = now()
    WHERE id = v_req_id;

    RETURN jsonb_build_object('success', true, 'request_id', v_req_id);
END;
$$;

-- Refrescar Grants
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_request_verification TO authenticated;

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Fix de Arquitectura de Pagos de Verificación deplegado con éxito.'; END $$;
