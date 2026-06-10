-- 🚀 SSOT: Sistema de Gestión de Planes (Downgrades/Upgrades)
-- Esta función maneja los cambios de plan de forma segura y atómica.

CREATE OR REPLACE FUNCTION rpc_change_user_plan(
    p_new_plan_id TEXT,
    p_immediate BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_plan TEXT;
    v_current_expires TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No autorizado', 'success', false);
    END IF;

    -- Obtener estado actual
    SELECT plan, plan_expires_at INTO v_current_plan, v_current_expires
    FROM public.perfiles
    WHERE id = v_user_id;

    -- Si el cambio es INMEDIATO o si el usuario no tiene plan activo (free)
    IF p_immediate OR v_current_plan IS NULL OR v_current_plan = 'free' OR v_current_expires < now() THEN
        UPDATE public.perfiles
        SET 
            plan = p_new_plan_id,
            planId = p_new_plan_id,
            plan_expires_at = CASE 
                WHEN p_new_plan_id = 'free' THEN NULL 
                ELSE now() + interval '30 days' 
            END,
            plan_next_id = NULL -- Limpiar cualquier cambio programado
        WHERE id = v_user_id;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Plan actualizado inmediatamente',
            'new_plan', p_new_plan_id
        );
    ELSE
        -- Cambio PROGRAMADO (Downgrade respetuoso)
        UPDATE public.perfiles
        SET plan_next_id = p_new_plan_id
        WHERE id = v_user_id;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Cambio programado para el final del ciclo',
            'next_plan', p_new_plan_id,
            'expires_at', v_current_expires
        );
    END IF;
END;
$$;

-- 🛡️ Garantizar permisos
GRANT EXECUTE ON FUNCTION rpc_change_user_plan(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_change_user_plan(TEXT, BOOLEAN) TO service_role;
