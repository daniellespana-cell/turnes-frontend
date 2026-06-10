-- 🧠 TURNES SYNC ENGINE v2.0
-- OBJETIVO: Conexión total de Datos (Rating, Éxitos y Ubicación)
-- Este script unifica la BD con los Hooks y la UI.

BEGIN;

-- 1. ASEGURAR COLUMNAS EN PERFILES
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS calificacion NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS completed_shifts INTEGER DEFAULT 0;

-- 2. FUNCIÓN MAESTRA DE ACTUALIZACIÓN DE PERFIL (Cero Inventos)
CREATE OR REPLACE FUNCTION rpc_sync_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_rating NUMERIC;
    v_exitos INTEGER;
BEGIN
    -- Calcular Promedio REAL (Fallback 0.0, NO 5.0)
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) 
    INTO v_rating
    FROM public.reviews 
    WHERE target_id = p_user_id;

    -- Calcular Conteo de Éxitos
    SELECT COUNT(*) 
    INTO v_exitos
    FROM public.postulaciones
    WHERE user_id = p_user_id AND status = 'finalizado';

    -- Sincronización de todas las columnas posibles para evitar "fantasmas"
    UPDATE public.perfiles
    SET 
        rating = v_rating,
        calificacion = v_rating,
        completed_shifts = v_exitos,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGERS DE SINCRONIZACIÓN AUTOMÁTICA
CREATE OR REPLACE FUNCTION trigger_sync_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'reviews' THEN
        PERFORM public.rpc_sync_user_stats(NEW.target_id);
    ELSIF TG_TABLE_NAME = 'postulaciones' THEN
        PERFORM public.rpc_sync_user_stats(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_reviews ON public.reviews;
CREATE TRIGGER tr_sync_reviews AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION trigger_sync_stats();

DROP TRIGGER IF EXISTS tr_sync_postulaciones ON public.postulaciones;
CREATE TRIGGER tr_sync_postulaciones AFTER INSERT OR UPDATE ON public.postulaciones FOR EACH ROW EXECUTE FUNCTION trigger_sync_stats();

-- 4. ACTUALIZACIÓN DE LA RPC DE BÚSQUEDA (Rendimiento Elite)
DROP FUNCTION IF EXISTS buscar_talento_cercano(double precision, double precision, double precision, text);

CREATE OR REPLACE FUNCTION buscar_talento_cercano(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 50,
    search_query text DEFAULT ''
)
RETURNS TABLE (
    id uuid,
    nombre_display text,
    bio text,
    skills text[],
    avatar_url text,
    lat double precision,
    lng double precision,
    distancia_mts float,
    verificado boolean,
    rating numeric,
    exitos int,
    sector text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre_display,
        p.bio,
        p.skills,
        p.avatar_url,
        p.lat,
        p.lng,
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        p.verificado,
        p.rating as rating, -- 🛡️ Ahora confiamos en esta columna porque el trigger la mantiene perfecta
        p.completed_shifts as exitos,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid()
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    AND (
        p.geo_point IS NULL 
        OR ST_DWithin(
            p.geo_point, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radio_km * 1000
        )
    )
    ORDER BY distancia_mts ASC NULLS LAST;
END;
$$;

-- 5. SINCRONIZACIÓN HISTÓRICA FINAL
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.perfiles WHERE rol = 'postulante' LOOP
        PERFORM public.rpc_sync_user_stats(r.id);
    END LOOP;
END $$;

COMMIT;
