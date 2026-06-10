-- 🛡️ WEBHOOK ROUTING ROBUSTO (VERSION 4.2 - ALINEADO CON DATOS REALES)
-- Este script sincroniza el Webhook con el formato de referencia real: UUID-TIPO-TIMESTAMP

CREATE OR REPLACE FUNCTION public.handle_wompi_webhook(event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id text;
    v_reference text;
    v_status text;
    v_amount_cents bigint;
    v_user_id uuid;
    v_type_code text;
    v_item_type text;
BEGIN
    -- 1. Extracción de datos básicos
    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_status := event_data->'data'->'transaction'->>'status';
    v_amount_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::bigint;

    -- 2. Registro del evento para auditoría
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload)
    VALUES (v_transaction_id, v_reference, v_amount_cents, v_status, event_data);

    -- 3. Si no está aprobado, terminamos
    IF v_status <> 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'logged', 'action', 'none');
    END IF;

    -- 4. PARSER INTELIGENTE (Basado en el formato UUID-TIPO-ID)
    -- Ejemplo: 0d03efbf-...-R-123456
    BEGIN
        v_user_id := split_part(v_reference, '-', 1)::UUID;
        v_type_code := split_part(v_reference, '-', 2);
        
        -- Mapeo de códigos a lógica de negocio
        v_item_type := CASE 
            WHEN v_type_code = 'R' THEN 'recharge'
            WHEN v_type_code = 'S' THEN 'plan'
            WHEN v_type_code = 'V' THEN 'verification'
            ELSE 'unknown'
        END;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Referencia inválida para el parser');
    END;

    -- 5. ENRUTAMIENTO DE LÓGICA DE NEGOCIO
    
    -- CASO A: RECARGAS DE SALDO (R)
    IF v_item_type = 'recharge' THEN
        -- Actualizar billetera
        UPDATE public.billeteras
        SET saldo = saldo + (v_amount_cents / 100),
            updated_at = now()
        WHERE id = v_user_id;

        -- Registrar movimiento
        INSERT INTO public.movimientos (billetera_id, monto, concepto, referencia, estado, metadata)
        VALUES (
            v_user_id, 
            (v_amount_cents / 100), 
            'Recarga de Saldo (Wompi)', 
            v_transaction_id, 
            'completado', 
            jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook', 'item_type', 'recharge')
        );

    -- CASO B: SUSCRIPCIONES (S)
    ELSIF v_item_type = 'plan' THEN
        -- Aquí podrías llamar a rpc_change_user_plan o similar
        -- Por ahora, acreditamos como movimiento de servicio
        INSERT INTO public.movimientos (billetera_id, monto, concepto, referencia, estado, metadata)
        VALUES (
            v_user_id, 
            -(v_amount_cents / 100), 
            'Pago de Suscripción', 
            v_transaction_id, 
            'completado', 
            jsonb_build_object('wompi_id', v_transaction_id, 'item_type', 'plan')
        );
        
        -- Actualizar plan en perfil si es necesario
        -- UPDATE public.perfiles SET plan = ... WHERE id = v_user_id;

    -- CASO C: VERIFICACIONES / OTROS (V)
    ELSIF v_item_type = 'verification' THEN
        -- Registrar como pago de servicio
        INSERT INTO public.movimientos (billetera_id, monto, concepto, referencia, estado, metadata)
        VALUES (
            v_user_id, 
            -(v_amount_cents / 100), 
            'Servicio de Verificación Elite', 
            v_transaction_id, 
            'completado', 
            jsonb_build_object('wompi_id', v_transaction_id, 'item_type', 'verification')
        );
    END IF;

    RETURN jsonb_build_object('status', 'success', 'user_id', v_user_id, 'item_type', v_item_type);
END;
$$;
