-- 🛠️ PATCH: Fix Búsqueda de Talento (Null Geolocation Support)
-- Los candidatos que aún no han concedido permisos de ubicación (geo_point IS NULL)
-- estaban siendo excluidos de las búsquedas por ST_DWithin.
-- Esta actualización permite verlos al final de la lista.

BEGIN;

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
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        p.verificado,
        p.rating,
        p.completed_shifts,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid() -- Ocultar al propio usuario de sus búsquedas
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    AND (
        p.geo_point IS NULL -- ✅ Permitir candidatos sin ubicación registrada
        OR ST_DWithin(
            p.geo_point, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radio_km * 1000
        )
    )
    ORDER BY distancia_mts ASC;
END;
$$;

COMMIT;