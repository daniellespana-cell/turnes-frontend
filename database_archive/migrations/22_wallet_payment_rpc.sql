-- 💳 22_wallet_payment_rpc.sql
-- ARCHITECTURE: SENIOR (Zero Friction, ACID Compliant)
-- Purpose: Process a microservice or plan purchase using internal wallet balance securely.

BEGIN;

CREATE OR REPLACE FUNCTION rpc_procesar_pago_wallet(
    p_item_id text,    -- Can be slug (for plans) or UUID (for microservices)
    p_item_type text,  -- 'plan' or 'service'
    p_amount numeric,
    p_concept text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to ensure atomic execution
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Sesión no válida.';
    END IF;

    -- 1. 🔒 LOCK: Bloquear Billetera (Evita Race Conditions / Doble Gasto)
    SELECT saldo INTO v_current_balance
    FROM billeteras
    WHERE id = v_user_id
    FOR UPDATE; -- Fundamental: NINGUNA otra transacción puede tocar el saldo hasta que esta termine.
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'WALLET_NOT_FOUND: La empresa no tiene una billetera activa.';
    END IF;

    -- 2. 🛡️ VERIFICAR FONDOS
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Saldo % insuficiente para pago de %', v_current_balance, p_amount;
    END IF;

    -- 3. 💸 EJECUTAR DESCUENTO
    v_new_balance := v_current_balance - p_amount;
    
    UPDATE billeteras
    SET saldo = v_new_balance, updated_at = now()
    WHERE id = v_user_id;

    -- 4. 🧾 REGISTRAR MOVIMIENTO (Auditoría Financiera)
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (
        v_user_id,
        'PAGO_SERVICIO',
        -p_amount, -- Negativo para mostrar que salió plata
        p_concept,
        jsonb_build_object(
            'item_id', p_item_id, 
            'item_type', p_item_type, 
            'payment_method', 'wallet_internal',
            'timestamp', now()
        )
    )
    RETURNING id INTO v_tx_id;

    -- 5. 🎁 ENTREGAR EL SERVICIO
    IF p_item_type = 'plan' THEN
        -- Si es un plan, actualizamos el perfil de la empresa directamente.
        UPDATE perfiles
        SET plan = p_concept, updated_at = now()
        WHERE id = v_user_id;
    END IF;
    -- Nota: Para microservicios (Ej: Verificación Élite), la lógica de entrega (Ej: añadir badge)
    -- puede ir aquí, o ser manejada por un disparador (Trigger) escuchando inserts a movimientos.
    -- Por diseño KISS actual, el frontend maneja la redirección al éxito si esto no falla.
    
    -- Si llegó aquí, todo fue un éxito y el COMMIT ocurre automáticamente al salir de la función.
    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'tx_id', v_tx_id
    );
END;
$$;

COMMIT;
