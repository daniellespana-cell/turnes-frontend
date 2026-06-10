-- fix_last_activity_tracking.sql
-- 🛠️ CORRECCIÓN DE INFRAESTRUCTURA: TRACKING DE ACTIVIDAD REAL
-- Sincroniza la actividad del usuario con el motor de reputación.

BEGIN;

-- 1. Añadir columna si no existe
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Trigger para actualizar actividad en acciones clave
CREATE OR REPLACE FUNCTION public.trg_refresh_last_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Identificar al usuario según la tabla
    IF TG_TABLE_NAME = 'postulaciones' THEN v_user_id := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'mensajes' THEN v_user_id := NEW.sender_id;
    ELSIF TG_TABLE_NAME = 'reviews' THEN 
        -- Actividad tanto para el que califica como para el que es calificado
        UPDATE public.perfiles SET last_activity_at = NOW() WHERE id = NEW.author_id;
        UPDATE public.perfiles SET last_activity_at = NOW() WHERE id = NEW.target_id;
        RETURN NEW;
    END IF;

    IF v_user_id IS NOT NULL THEN
        UPDATE public.perfiles SET last_activity_at = NOW() WHERE id = v_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a Postulaciones
DROP TRIGGER IF EXISTS trg_activity_postulacion ON public.postulaciones;
CREATE TRIGGER trg_activity_postulacion AFTER INSERT OR UPDATE ON public.postulaciones
FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_last_activity();

-- Aplicar a Mensajes
DROP TRIGGER IF EXISTS trg_activity_mensaje ON public.mensajes;
CREATE TRIGGER trg_activity_mensaje AFTER INSERT ON public.mensajes
FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_last_activity();

-- Aplicar a Reviews
DROP TRIGGER IF EXISTS trg_activity_review ON public.reviews;
CREATE TRIGGER trg_activity_review AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_last_activity();


-- 3. ACTUALIZAR EL MOTOR DE REPUTACIÓN PARA USAR ESTA COLUMNA
CREATE OR REPLACE FUNCTION public.rpc_calculate_advanced_reputation(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_weight NUMERIC := 0;
    v_weighted_sum NUMERIC := 0;
    v_record RECORD;
    v_days_old INT;
    v_time_weight NUMERIC;
    v_rating_weight NUMERIC;
    v_final_weight NUMERIC;
    v_final_rating NUMERIC;
    v_last_activity TIMESTAMPTZ;
    v_days_inactive INT;
    v_engagement_factor NUMERIC := 1.0;
BEGIN
    -- 🎯 FIX: Ahora usamos last_activity_at (Verdadera actividad)
    SELECT last_activity_at INTO v_last_activity FROM public.perfiles WHERE id = p_user_id;
    v_days_inactive := EXTRACT(DAY FROM (now() - COALESCE(v_last_activity, now())));

    -- 1. BAYESIAN SMOOTHING
    v_weighted_sum := 5.0 * 2.0;
    v_total_weight := 2.0;

    -- 2. REVIEWS
    FOR v_record IN (SELECT rating, created_at FROM public.reviews WHERE target_id = p_user_id) LOOP
        v_days_old := EXTRACT(DAY FROM (now() - v_record.created_at));
        
        IF v_days_old <= 30 THEN v_time_weight := 2.0;
        ELSIF v_days_old <= 90 THEN v_time_weight := 1.0;
        ELSE v_time_weight := 0.5;
        END IF;

        IF v_record.rating = 1 THEN v_rating_weight := 3.0;
        ELSIF v_record.rating = 2 THEN v_rating_weight := 2.0;
        ELSE v_rating_weight := 1.0;
        END IF;

        v_final_weight := v_time_weight * v_rating_weight;
        v_weighted_sum := v_weighted_sum + (v_record.rating * v_final_weight);
        v_total_weight := v_total_weight + v_final_weight;
    END LOOP;

    v_final_rating := v_weighted_sum / v_total_weight;

    -- 3. ENGAGEMENT DECAY
    IF v_days_inactive > 30 THEN
        v_engagement_factor := 0.95 ^ (floor((v_days_inactive - 30) / 7) + 1);
        v_final_rating := v_final_rating * v_engagement_factor;
    END IF;

    RETURN GREATEST(1.0, LEAST(5.0, ROUND(v_final_rating::numeric, 1)));
END;
$$;

-- 4. ACTUALIZACIÓN RETROACTIVA MEJORADA (Senior Accuracy)
UPDATE public.perfiles p
SET last_activity_at = (
    SELECT COALESCE(MAX(act_date), p.updated_at)
    FROM (
        SELECT created_at as act_date FROM public.postulaciones WHERE user_id = p.id
        UNION ALL
        SELECT created_at as act_date FROM public.mensajes WHERE sender_id = p.id
        UNION ALL
        SELECT created_at as act_date FROM public.reviews WHERE author_id = p.id OR target_id = p.id
    ) AS activity
);

COMMIT;
