-- 🛡️ TURNES RATING SYNC FINAL
-- OBJETIVO: Sincronización absoluta entre Calificación (3.8) y Tarjetas.

BEGIN;

-- 1. RE-SINCRONIZACIÓN DE TODOS LOS PERFILES AHORA
-- Forzamos que el 3.8 se escriba en todas las columnas de la DB.
DO $$
DECLARE
    r RECORD;
    v_rating NUMERIC;
    v_exitos INTEGER;
BEGIN
    FOR r IN SELECT id FROM public.perfiles WHERE rol = 'postulante' LOOP
        -- Calcular la verdad absoluta desde reviews
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) 
        INTO v_rating
        FROM public.reviews 
        WHERE target_id = r.id;

        -- Calcular éxitos
        SELECT COUNT(*) INTO v_exitos FROM public.postulaciones WHERE user_id = r.id AND status = 'finalizado';

        -- Escribir en TODAS las columnas sospechosas
        UPDATE public.perfiles 
        SET rating = v_rating, calificacion = v_rating, completed_shifts = v_exitos 
        WHERE id = r.id;
    END LOOP;
END $$;

-- 2. PARCHADO DE LA RPC DE BÚSQUEDA
-- Nos aseguramos de que devuelva nombre_display y rating real.
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
        p.rating as rating,
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

COMMIT;
