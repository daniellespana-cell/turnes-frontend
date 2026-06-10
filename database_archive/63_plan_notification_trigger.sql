-- 🔔 63_plan_notification_trigger.sql
-- Trigger inteligente que notifica automáticamente cuando un usuario cambia de plan.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar si el plan realmente cambió y no es nulo
    IF (OLD.plan IS DISTINCT FROM NEW.plan) THEN
        -- Despachar notificación usando la función existente de notificaciones
        PERFORM public.rpc_create_notification(
            NEW.id,
            'PLAN_CHANGED',
            NULL, -- No hay reference_id específico más allá del perfil
            jsonb_build_object(
                'old_plan', OLD.plan,
                'new_plan', NEW.plan
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si existe para ser idempotente
DROP TRIGGER IF EXISTS tr_notify_plan_change ON public.perfiles;

-- Crear el trigger en la tabla perfiles
CREATE TRIGGER tr_notify_plan_change
    AFTER UPDATE OF plan ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_plan_change();

COMMIT;
