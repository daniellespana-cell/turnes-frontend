-- reputation_algorithm_v2.sql
-- 🌟 REPUTATION ENGINE 2.0: WEIGHTED DECAY & PENALTY MODEL
-- Objetivo: Hacer que la calificación sea "real" y dinámica, no un promedio plano.

BEGIN;

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
    -- 0. OBTENER ÚLTIMA ACTIVIDAD
    SELECT updated_at INTO v_last_activity FROM public.perfiles WHERE id = p_user_id;
    v_days_inactive := EXTRACT(DAY FROM (now() - COALESCE(v_last_activity, now())));

    -- 1. BAYESIAN SMOOTHING (Suavizado inicial)
    v_weighted_sum := 5.0 * 2.0;
    v_total_weight := 2.0;

    -- 2. ITERAR SOBRE RESEÑAS REALES (Decaimiento temporal de reseñas)
    FOR v_record IN (SELECT rating, created_at FROM public.reviews WHERE target_id = p_user_id) LOOP
        v_days_old := EXTRACT(DAY FROM (now() - v_record.created_at));

        -- A. Peso por Tiempo (Recencia de la reseña)
        IF v_days_old <= 30 THEN v_time_weight := 2.0;
        ELSIF v_days_old <= 90 THEN v_time_weight := 1.0;
        ELSE v_time_weight := 0.5;
        END IF;

        -- B. Peso por Gravedad (Asimetría de la nota)
        IF v_record.rating = 1 THEN v_rating_weight := 3.0;
        ELSIF v_record.rating = 2 THEN v_rating_weight := 2.0;
        ELSE v_rating_weight := 1.0;
        END IF;

        v_final_weight := v_time_weight * v_rating_weight;
        v_weighted_sum := v_weighted_sum + (v_record.rating * v_final_weight);
        v_total_weight := v_total_weight + v_final_weight;
    END LOOP;

    -- 3. CALCULAR PROMEDIO BASE
    v_final_rating := v_weighted_sum / v_total_weight;

    -- 4. APLICAR DECAY POR INACTIVIDAD (Engagement Factor)
    -- Si no ha usado la app en 30 días, pierde un 5% cada semana (Efecto Duolingo)
    IF v_days_inactive > 30 THEN
        v_engagement_factor := 0.95 ^ (floor((v_days_inactive - 30) / 7) + 1);
        v_final_rating := v_final_rating * v_engagement_factor;
    END IF;

    -- 5. RESULTADO FINAL (Redondeado a 1 decimal)
    RETURN GREATEST(1.0, LEAST(5.0, ROUND(v_final_rating::numeric, 1)));
END;
$$;

-- ─── TRIGGER DE ACTUALIZACIÓN AUTOMÁTICA ───
-- Cada vez que entra una review, se recalcula la nota global del perfil.
CREATE OR REPLACE FUNCTION public.trg_update_global_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.perfiles 
    SET calificacion = public.rpc_calculate_advanced_reputation(NEW.target_id)
    WHERE id = NEW.target_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_added ON public.reviews;
CREATE TRIGGER on_review_added
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_update_global_rating();

COMMIT;
