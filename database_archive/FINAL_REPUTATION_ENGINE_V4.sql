-- 🏛️ TURNES REPUTATION ENGINE V4 (Single Source of Truth)
-- Objetivo: Centralizar el cálculo de reputación en el kernel de la DB.

BEGIN;

-- 1. PREPARACIÓN DE LA TABLA PERFILES
-- Estandarizamos las columnas de lectura rápida.
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS reputation_score NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reputation_count INTEGER DEFAULT 0;

-- 2. EL CEREBRO: Función de Sincronización Atómica
CREATE OR REPLACE FUNCTION public.fn_sync_talent_reputation()
RETURNS TRIGGER AS $$
DECLARE
    v_score NUMERIC;
    v_count INTEGER;
    v_target_id UUID;
BEGIN
    -- Identificamos al usuario evaluado
    v_target_id := COALESCE(NEW.target_id, OLD.target_id);

    -- Calculamos la verdad absoluta desde la tabla reviews
    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0),
        COUNT(*)
    INTO v_score, v_count
    FROM public.reviews
    WHERE target_id = v_target_id;

    -- Sincronizamos el perfil de forma atómica
    UPDATE public.perfiles
    SET 
        reputation_score = v_score,
        reputation_count = v_count,
        rating = v_score,
        calificacion = v_score,
        updated_at = NOW()
    WHERE id = v_target_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. EL VIGILANTE: Trigger de Integridad
DROP TRIGGER IF EXISTS tr_sync_reputation_on_review_change ON public.reviews;
CREATE TRIGGER tr_sync_reputation_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_talent_reputation();

-- 4. SINCRONIZACIÓN HISTÓRICA MASIVA
-- Este bloque alinea a todos los usuarios actuales con la realidad de sus reseñas.
DO $$
DECLARE
    r RECORD;
    v_score NUMERIC;
    v_count INTEGER;
BEGIN
    FOR r IN SELECT id FROM public.perfiles LOOP
        -- Calculamos la verdad para este usuario específico
        SELECT 
            COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0),
            COUNT(*)
        INTO v_score, v_count
        FROM public.reviews
        WHERE target_id = r.id;

        -- Actualizamos su perfil directamente
        UPDATE public.perfiles
        SET 
            reputation_score = v_score,
            reputation_count = v_count,
            rating = v_score,
            calificacion = v_score
        WHERE id = r.id;
    END LOOP;
END $$;

COMMIT;
