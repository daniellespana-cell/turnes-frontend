-- 💰 5_finance_recharge_fix.sql
-- Complemento para habilitar recargas de saldo (Necesario para testing).

BEGIN;

-- RPC: RECARGAR SALDO (Simulado / Manual)
-- Esta función es llamada por financeService.recharge()
CREATE OR REPLACE FUNCTION rpc_recargar_saldo(
    monto_recarga numeric,
    referencia_pago text
)
RETURNS table (nuevo_saldo numeric, tx_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;
BEGIN
    v_user_id := auth.uid();

    -- 1. Validar Monto
    IF monto_recarga < 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: El monto debe ser positivo.';
    END IF;

    -- 2. Lock & Get Balance
    -- Si la billetera no existe, la creamos (Self-healing)
    INSERT INTO billeteras (id, saldo)
    VALUES (v_user_id, 0)
    ON CONFLICT (id) DO NOTHING;

    SELECT saldo INTO v_current_balance
    FROM billeteras
    WHERE id = v_user_id
    FOR UPDATE;

    -- 3. Calcular Nuevo Saldo
    v_new_balance := v_current_balance + monto_recarga;

    -- 4. Actualizar Billetera
    UPDATE billeteras
    SET saldo = v_new_balance, updated_at = now()
    WHERE id = v_user_id;

    -- 5. Registrar Movimiento (DEPOSITO)
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (
        v_user_id,
        'DEPOSITO',
        monto_recarga,
        'Recarga de Saldo (Manual/Test)',
        jsonb_build_object('ref', referencia_pago, 'timestamp', now())
    )
    RETURNING id INTO v_tx_id;

    -- 6. Retornar Resultado
    RETURN QUERY SELECT v_new_balance, v_tx_id;
END;
$$;

COMMIT;
