-- =========================================================================
-- fix_talent_search_v3.sql
-- OBJETIVO: Búsqueda SSOT, Paginación Nativa y Filtrado Inteligente.
-- Este script REEMPLAZA la función `buscar_talento_cercano` actual.
-- =========================================================================

BEGIN;

DROP FUNCTION IF EXISTS public.buscar_talento_cercano(double precision, double precision, double precision, text);
DROP FUNCTION IF EXISTS public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer);

-- 1. CREACIÓN DEL RPC DE BÚSQUEDA AVANZADA
CREATE OR REPLACE FUNCTION public.buscar_talento_cercano(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 5,
    search_query text DEFAULT '',
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0,
    p_sector text DEFAULT 'TODOS'
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
        public.fn_get_completed_shifts(p.id) as completed_shifts,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid()
    -- 🛑 ZERO-TRUST: El talento DEBE tener ubicación real. Cero fantasmas.
    AND p.geo_point IS NOT NULL
    AND p.lat IS NOT NULL
    AND p.lng IS NOT NULL
    -- 1. FILTRO DE DISTANCIA (PostGIS Estricto)
    AND ST_DWithin(
        p.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000
    )
    -- 2. FILTRO DE TEXTO INTELIGENTE (Nombre, Biografía, Rol o Habilidades)
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.rol::text ILIKE '%' || search_query || '%'
        OR EXISTS (SELECT 1 FROM unnest(p.skills) s WHERE s ILIKE '%' || search_query || '%')
    )
    -- 3. FILTRO DE SECTOR / CATEGORÍA TAXONÓMICA
    AND (
        p_sector = 'TODOS' 
        OR p.sector = p_sector
        OR EXISTS (SELECT 1 FROM unnest(p.skills) s WHERE s ILIKE '%' || p_sector || '%')
    )
    ORDER BY distancia_mts ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 2. PERMISOS DE SEGURIDAD
REVOKE EXECUTE ON FUNCTION public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer, text) TO authenticated;

-- 3. FORZAR RECARGA EN POSTGREST (Evita reinicio manual)
NOTIFY pgrst, 'reload schema';

COMMIT;
