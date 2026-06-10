-- 🛡️ PASO 2: CREAR EL RPC SEGURO (Backend para React)
-- Permite al usuario activar/desactivar la auto-renovación asegurando que solo altere a SU propio perfil
CREATE OR REPLACE FUNCTION public.rpc_toggle_subscription_renewal(
    p_cancel_status BOOLEAN
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Obtener usuario autenticado
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Actualizar bandera
    UPDATE public.perfiles 
    SET cancel_at_period_end = p_cancel_status,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- 3. Retornar Estado Seguro
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Estado de suscripción actualizado',
        'cancel_at_period_end', p_cancel_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-aplicar permisos vitales
GRANT EXECUTE ON FUNCTION public.rpc_toggle_subscription_renewal TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_toggle_subscription_renewal TO service_role;
