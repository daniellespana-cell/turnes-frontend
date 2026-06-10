-- =========================================================================
-- fix_pagination_talento.sql
-- OBJETIVO: Inyectar Paginación (limit/offset) en el buscador geoespacial.
-- =========================================================================

BEGIN;

DROP FUNCTION IF EXISTS public.buscar_talento_cercano(double precision, double precision, double precision, text);

CREATE OR REPLACE FUNCTION public.buscar_talento_cercano(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 5,
    search_query text DEFAULT '',
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
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
    completed_shifts int,
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
        COALESCE(
            ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography), 
            9999999
        ) as distancia_mts,
        p.verificado,
        p.rating,
        public.fn_get_completed_shifts(p.id) as completed_shifts,
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
    ORDER BY distancia_mts ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

COMMIT;
