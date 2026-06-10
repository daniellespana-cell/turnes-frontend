-- 🛡️ RPC ACERO V2: rpc_procesar_pago_wallet_v2
-- Blindado contra inyección de precios desde el frontend.
-- Mueve la autoridad de precios al backend.

CREATE OR REPLACE FUNCTION public.rpc_procesar_pago_wallet_v2(
  p_item_id text,
  p_item_type text,
  p_concept text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_billetera billeteras%ROWTYPE;
  v_tx_id uuid;
  v_perfil perfiles%ROWTYPE;
  v_amount numeric;
  v_final_concept text;
BEGIN
  -- 1. Obtener usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- 2. AUTORIDAD DE PRECIOS (Backend Source of Truth)
  IF p_item_type = 'service' AND p_item_id = 'verify' THEN
    v_amount := 25000; -- Precio fijo para verificación (podría moverse a tabla microservices después)
    v_final_concept := COALESCE(p_concept, 'Insignia de Trabajador Verificado');
  ELSIF p_item_type = 'plan' THEN
    -- Eliminación de Deuda Técnica: Consultar la tabla de planes real
    SELECT costo_mensual INTO v_amount FROM planes WHERE slug ILIKE p_item_id;
    IF NOT FOUND THEN
       RAISE EXCEPTION 'INVALID_PLAN';
    END IF;
    v_final_concept := COALESCE(p_concept, 'Suscripción Plan ' || p_item_id);
  ELSE
    RAISE EXCEPTION 'INVALID_ITEM';
  END IF;

  -- 3. VALIDACIÓN ANTI-DUPLICADOS (Lock optimista)
  SELECT * INTO v_perfil FROM perfiles WHERE id = v_user_id FOR UPDATE;

  IF p_item_type = 'service' AND p_item_id = 'verify' THEN
    IF v_perfil.verificado = true THEN
       RAISE EXCEPTION 'ALREADY_ACQUIRED';
    END IF;
  ELSIF p_item_type = 'plan' THEN
    IF v_perfil.plan ILIKE p_item_id AND (v_perfil.plan_expires_at IS NULL OR v_perfil.plan_expires_at > NOW()) THEN
       RAISE EXCEPTION 'ALREADY_ACQUIRED';
    END IF;
  END IF;

  -- 4. Verificar billetera y bloquear para transaccionalidad
  SELECT * INTO v_billetera FROM billeteras WHERE id = v_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND';
  END IF;

  IF v_billetera.saldo < v_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
  END IF;

  -- 5. Ejecutar transacciones (Débito + Beneficio)
  UPDATE billeteras 
  SET saldo = saldo - v_amount,
      updated_at = NOW()
  WHERE id = v_user_id;

  IF p_item_type = 'service' AND p_item_id = 'verify' THEN
     UPDATE perfiles SET verificado = true, updated_at = NOW() WHERE id = v_user_id;
  ELSIF p_item_type = 'plan' THEN
     UPDATE perfiles SET plan = p_item_id, plan_expires_at = NOW() + INTERVAL '30 days', updated_at = NOW() WHERE id = v_user_id;
  END IF;

  -- 6. Auditoría (Movimiento)
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
    v_amount, 
    v_final_concept, 
    'COMPLETADO',
    jsonb_build_object('item_id', p_item_id, 'item_type', p_item_type, 'v2', true)
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_billetera.saldo - v_amount,
    'tx_id', v_tx_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet_v2(text, text, text) TO authenticated;
