-- 🚀 Single Source of Truth para Acreditación de Saldo (Webhook)
-- Este RPC garantiza que las recargas sean atómicas y solo se ejecuten desde el backend seguro.

CREATE OR REPLACE FUNCTION public.rpc_acreditar_saldo_webhook(
    p_billetera_id uuid,
    p_monto numeric,
    p_wompi_id text,
    p_referencia text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Insertar el movimiento (Historial)
    -- Guardamos el ID de wompi en 'metadata' (JSONB) en vez de 'referencia' (TEXT) 
    -- para que la interfaz pueda hacer polling sin errores de tipo.
    INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia, metadata)
    VALUES (
        p_billetera_id, 
        'DEPOSITO', 
        p_monto, 
        'Recarga vía Wompi (Webhook)', 
        p_referencia,
        jsonb_build_object('wompi_id', p_wompi_id)
    );

    -- 2. Incrementar el saldo de la billetera atómicamente
    UPDATE public.billeteras
    SET saldo = saldo + p_monto,
        updated_at = now()
    WHERE id = p_billetera_id;

    -- 3. Crear notificación in-app para el usuario
    INSERT INTO public.notificaciones (user_id, tipo, metadata)
    VALUES (
        p_billetera_id,
        'RECHARGE_SUCCESS',
        jsonb_build_object('amount', p_monto, 'wompi_id', p_wompi_id)
    );

END;
$$;
