-- =============================================================================
-- 65_fix_plan_notification_trigger.sql
-- 🔥 CORRECCIÓN CRÍTICA: El trigger anterior fallaba silenciosamente porque
--    intentaba llamar a rpc_create_notification(), que tenía REVOKE para
--    el rol 'authenticated'. La función trigger es SECURITY DEFINER, lo que
--    significa que puede insertar directamente en 'notificaciones' sin pasar
--    por la restricción de permisos del RPC.
--
-- SOLUCIÓN: Hacer el INSERT directo desde el trigger. Más simple, más robusto.
-- =============================================================================

BEGIN;

-- Reemplazar la función del trigger para que inserte DIRECTAMENTE en la tabla
-- en lugar de llamar a rpc_create_notification (que tenía el permiso revocado).
CREATE OR REPLACE FUNCTION public.fn_on_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER   -- 🛡️ Corre con permisos del creador (postgres/superuser), puede bypassear RLS
SET search_path = public
AS $$
BEGIN
    -- Solo actuar si el plan realmente cambió (evita notificaciones fantasma)
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
        -- Insertar DIRECTAMENTE en la tabla (sin pasar por el RPC restringido)
        INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
        VALUES (
            NEW.id,
            'PLAN_CHANGED',
            NULL,
            jsonb_build_object(
                'old_plan', COALESCE(OLD.plan, 'free'),
                'new_plan', COALESCE(NEW.plan, 'free')
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Garantizar permisos de EXECUTE en la función del trigger para los roles relevantes
-- (aunque no se llama manualmente, es buena práctica)
GRANT EXECUTE ON FUNCTION public.fn_on_plan_change() TO service_role;

-- Recrear el trigger (idempotente)
DROP TRIGGER IF EXISTS tr_notify_plan_change ON public.perfiles;

CREATE TRIGGER tr_notify_plan_change
    AFTER UPDATE OF plan ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_plan_change();

-- =============================================================================
-- VERIFICACIÓN: Prueba manual del trigger
-- Cambia temporalmente el plan de un usuario conocido y verifica en la tabla
-- notificaciones. Ejemplo:
--   UPDATE public.perfiles SET plan = 'pro' WHERE id = '<tu-user-id>';
--   SELECT * FROM public.notificaciones WHERE tipo = 'PLAN_CHANGED' ORDER BY created_at DESC LIMIT 5;
-- =============================================================================

COMMIT;
