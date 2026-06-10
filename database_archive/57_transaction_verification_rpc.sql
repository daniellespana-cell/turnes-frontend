-- 🛰️ RADAR DE ESPECTRO COMPLETO (V2)
-- Busca la transacción por ID, por Referencia o por metadatos.

CREATE OR REPLACE FUNCTION public.rpc_verify_transaction_status(p_wompi_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mov_id uuid;
    v_status text;
    v_user_id uuid;
BEGIN
    -- 1. Intentamos buscar el movimiento por múltiples campos
    SELECT id, estado, billetera_id INTO v_mov_id, v_status, v_user_id
    FROM public.movimientos
    WHERE referencia = p_wompi_id                       -- Caso 1: ID es la referencia
       OR metadata->>'wompi_id' = p_wompi_id             -- Caso 2: ID es el ID de Wompi
       OR metadata->>'reference' = p_wompi_id            -- Caso 3: ID es la referencia en metadata
    LIMIT 1;

    -- 2. Si no lo encontramos, buscamos en los eventos de Wompi directamente
    -- por si el disparador falló pero el evento llegó.
    IF v_mov_id IS NULL THEN
        SELECT transaction_id, status INTO v_mov_id, v_status
        FROM public.wompi_events
        WHERE transaction_id = p_wompi_id
           OR reference = p_wompi_id
        LIMIT 1;
        
        IF v_mov_id IS NOT NULL THEN
            -- Si lo encontramos en eventos pero no en movimientos, 
            -- devolvemos 'delayed' para que el usuario sepa que llegó pero no se ha procesado.
            RETURN jsonb_build_object(
                'found', true,
                'status', CASE WHEN v_status = 'APPROVED' THEN 'pending_credit' ELSE 'error' END,
                'is_event_only', true
            );
        END IF;
    END IF;

    IF v_mov_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'found', true,
            'movimiento_id', v_mov_id,
            'status', v_status,
            'is_event_only', false
        );
    ELSE
        RETURN jsonb_build_object('found', false);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_verify_transaction_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_verify_transaction_status(text) TO anon;
GRANT EXECUTE ON FUNCTION public.rpc_verify_transaction_status(text) TO service_role;
