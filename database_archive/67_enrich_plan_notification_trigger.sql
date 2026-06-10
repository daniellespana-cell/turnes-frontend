-- =============================================================================
-- 67_enrich_plan_notification_trigger.sql
-- 🚀 EVOLUCIÓN: Notificaciones Contextuales Inteligentes
-- 
-- Este trigger reemplaza al anterior (65_) y añade inteligencia de negocio:
-- 1. Determina si el cambio es UPGRADE o DOWNGRADE basándose en costo_mensual.
-- 2. Compara los features (beneficios) de los planes para extraer 
--    qué ganó (gained) o qué perdió (lost) el usuario.
-- 3. Emite tipos de notificación específicos (PLAN_UPGRADED o PLAN_DOWNGRADED).
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_on_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_plan RECORD;
    v_new_plan RECORD;
    v_gained TEXT;
    v_lost TEXT;
    v_event_type TEXT;
BEGIN
    -- Solo actuar si el plan realmente cambió
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
        
        -- Obtener detalles del plan anterior (por defecto 'basic')
        SELECT * INTO v_old_plan 
        FROM public.planes 
        WHERE slug = COALESCE(OLD.plan, 'basic');

        -- Obtener detalles del nuevo plan (por defecto 'basic')
        SELECT * INTO v_new_plan 
        FROM public.planes 
        WHERE slug = COALESCE(NEW.plan, 'basic');

        -- Fallback de seguridad si no encuentra los planes en DB
        IF v_old_plan IS NULL OR v_new_plan IS NULL THEN
            -- Insertar genérico si hay inconsistencia de datos
            INSERT INTO public.notificaciones (user_id, tipo, metadata)
            VALUES (
                NEW.id,
                'PLAN_CHANGED',
                jsonb_build_object('old_plan', OLD.plan, 'new_plan', NEW.plan)
            );
            RETURN NEW;
        END IF;

        -- Determinar tipo de evento
        IF COALESCE(v_new_plan.costo_mensual, 0) > COALESCE(v_old_plan.costo_mensual, 0) THEN
            v_event_type := 'PLAN_UPGRADED';
            
            -- ¿Qué ganó? (Features que están en el nuevo y no en el viejo)
            -- En Postgres no podemos hacer array difference fácil en plpgsql sin una subquery.
            -- Haremos una extracción simple del feature principal (índice 1 o 2).
            IF array_length(v_new_plan.features, 1) > 0 THEN
                v_gained := v_new_plan.features[1]; 
            ELSE
                v_gained := 'Mejores beneficios';
            END IF;
            v_lost := '';
            
        ELSE
            v_event_type := 'PLAN_DOWNGRADED';
            
            -- ¿Qué perdió? (Features que estaban en el viejo)
            IF array_length(v_old_plan.features, 1) > 0 THEN
                v_lost := v_old_plan.features[1]; 
            ELSE
                v_lost := 'Beneficios premium';
            END IF;
            v_gained := '';
            
        END IF;

        -- Insertar notificación enriquecida
        INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
        VALUES (
            NEW.id,
            v_event_type,
            NULL,
            jsonb_build_object(
                'old_plan', v_old_plan.nombre,
                'new_plan', v_new_plan.nombre,
                'gained', v_gained,
                'lost', v_lost
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Garantizar permisos
GRANT EXECUTE ON FUNCTION public.fn_on_plan_change() TO service_role;

-- Asegurar trigger
DROP TRIGGER IF EXISTS tr_notify_plan_change ON public.perfiles;

CREATE TRIGGER tr_notify_plan_change
    AFTER UPDATE OF plan ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_plan_change();

COMMIT;
