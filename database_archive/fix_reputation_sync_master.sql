-- fix_reputation_sync_master.sql
-- 🛠️ CORRECCIÓN DE INTEGRIDAD: SINCRONIZACIÓN DE REPUTACIÓN AVANZADA
-- Asegura que el valor calculado por el algoritmo (4.6) se guarde físicamente
-- en la tabla de perfiles para que sea visible en las tarjetas de exploración.

BEGIN;

-- 1. Función Maestra de Sincronización
CREATE OR REPLACE FUNCTION public.trg_sync_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Ejecutar el algoritmo avanzado para el usuario afectado (target_id)
    -- y guardar el resultado en la columna física 'calificacion'
    UPDATE public.perfiles 
    SET calificacion = public.rpc_calculate_advanced_reputation(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.target_id 
            ELSE NEW.target_id 
        END
    )
    WHERE id = (CASE WHEN TG_OP = 'DELETE' THEN OLD.target_id ELSE NEW.target_id END);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger en la tabla Reviews (Disparador principal)
DROP TRIGGER IF EXISTS trg_sync_rating_on_review ON public.reviews;
CREATE TRIGGER trg_sync_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_profile_rating();

-- 3. Sincronización por Actividad (Efecto Duolingo)
-- Cada vez que el usuario se activa, recalculamos por si el decaimiento cambió
CREATE OR REPLACE FUNCTION public.trg_sync_rating_on_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF TG_TABLE_NAME = 'postulaciones' THEN v_user_id := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'mensajes' THEN v_user_id := NEW.sender_id;
    END IF;

    IF v_user_id IS NOT NULL THEN
        UPDATE public.perfiles 
        SET calificacion = public.rpc_calculate_advanced_reputation(v_user_id)
        WHERE id = v_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_rating_activity_post ON public.postulaciones;
CREATE TRIGGER trg_sync_rating_activity_post
AFTER INSERT ON public.postulaciones
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_rating_on_activity();

DROP TRIGGER IF EXISTS trg_sync_rating_activity_msg ON public.mensajes;
CREATE TRIGGER trg_sync_rating_activity_msg
AFTER INSERT ON public.mensajes
FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_last_activity(); -- Ya actualiza last_activity_at

-- 4. SINCRONIZACIÓN INICIAL MASIVA (Repara el error actual de 5.0 vs 4.6)
UPDATE public.perfiles p
SET calificacion = public.rpc_calculate_advanced_reputation(p.id)
WHERE EXISTS (SELECT 1 FROM public.reviews WHERE target_id = p.id);

COMMIT;
