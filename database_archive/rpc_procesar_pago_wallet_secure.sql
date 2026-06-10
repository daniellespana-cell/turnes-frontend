-- 🛡️ FUNCION RPC ACERO: rpc_procesar_pago_wallet
-- Bloquea compras duplicadas directamente a nivel de Base de Datos.

CREATE OR REPLACE FUNCTION public.rpc_procesar_pago_wallet(
  p_item_id text,
  p_item_type text,
  p_amount numeric,
  p_concept text
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_billetera billeteras%ROWTYPE;
  v_tx_id uuid;
  v_perfil perfiles%ROWTYPE;
BEGIN
  -- 1. Obtener usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- 2. VALIDACIÓN ANTI-DUPLICADOS (Capa de Seguridad de Datos)
  -- Bloqueamos la fila del perfil para lectura concurrente
  SELECT * INTO v_perfil FROM perfiles WHERE id = v_user_id FOR UPDATE;

  IF p_item_type = 'service' AND p_item_id = 'verify' THEN
    IF v_perfil.verificado = true THEN
       RAISE EXCEPTION 'ALREADY_ACQUIRED';
    END IF;
  ELSIF p_item_type = 'plan' THEN
    -- Validamos si el usuario ya tiene el mismo plan exacto
    IF v_perfil.plan ILIKE p_item_id THEN
       RAISE EXCEPTION 'ALREADY_ACQUIRED';
    END IF;
  END IF;

  -- 3. Verificar datos de billetera y bloquear fila por Saldo
  SELECT * INTO v_billetera 
  FROM billeteras 
  WHERE id = v_user_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND';
  END IF;

  IF v_billetera.saldo < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
  END IF;

  -- 4. Descontar saldo de billetera
  UPDATE billeteras 
  SET saldo = saldo - p_amount,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- 5. Aplicar beneficios del producto al perfil del usuario
  IF p_item_type = 'service' AND p_item_id = 'verify' THEN
     UPDATE perfiles SET verificado = true, updated_at = NOW() WHERE id = v_user_id;
  ELSIF p_item_type = 'plan' THEN
     UPDATE perfiles SET plan = p_item_id, plan_expires_at = NOW() + INTERVAL '30 days', updated_at = NOW() WHERE id = v_user_id;
  END IF;

  -- 6. Registrar el movimiento / recibo
  INSERT INTO movimientos (
    billetera_id, 
    tipo, 
    monto, 
    concepto, 
    estado,
    metadata
  ) VALUES (
    v_user_id, 
    'RETIRO', 
    p_amount, 
    p_concept, 
    'COMPLETADO',
    jsonb_build_object('item_id', p_item_id, 'item_type', p_item_type)
  ) RETURNING id INTO v_tx_id;

  -- 7. Retornar Estado Seguro
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_billetera.saldo - p_amount,
    'tx_id', v_tx_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-aplicar permisos vitales
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet TO service_role;
