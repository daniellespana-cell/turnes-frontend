-- =========================================================================
-- 33_restore_strict_geo_search.sql
-- OBJETIVO: Restaurar el "Single Source of Truth" (SSOT) para la búsqueda de talento.
-- ARQUITECTURA SENIOR: 
--  - Zero-Trust Location (No acepta coordenadas nulas, ni usuarios sin GPS)
--  - Hard Geo-fencing (Nadie fuera de los X km pasa)
--  - Quality Gate (Usuarios sin habilidades ("fantasmas") son filtrados estrictamente)
-- =========================================================================

BEGIN;

-- 1. Limpieza de firmas anteriores para evitar "is not unique"
DROP FUNCTION IF EXISTS public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer);

-- 2. Creación del RPC Definitivo
CREATE OR REPLACE FUNCTION public.buscar_talento_cercano(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 5,
    search_query text DEFAULT '',
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
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
SET search_path = public, extensions -- FIX SEGURIDAD: Evitar inyección de schemas
AS $$
BEGIN
    -- 🛑 ZERO-TRUST (Nivel 1): Si el cliente envía coordenadas falsas o vacías, abortamos.
    IF user_lat IS NULL OR user_lng IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.nombre_display,
        p.bio,
        p.skills,
        p.avatar_url,
        p.lat,
        p.lng,
        -- PostGIS puro y duro, nada de aproximaciones matemáticas en PL/pgSQL
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        p.verificado,
        p.rating,
        p.completed_shifts,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    -- 🛡️ REGLA DE HIERRO: El talento DEBE tener ubicación real. Cero "nulls" arrastrados de la BD.
    AND p.lat IS NOT NULL 
    AND p.lng IS NOT NULL
    AND p.geo_point IS NOT NULL
    -- 🛡️ QUALITY GATE: Filtramos tajantemente a quienes no tienen habilidades registradas ("los que no tienen habilidades")
    AND p.skills IS NOT NULL 
    AND array_length(p.skills, 1) > 0
    -- 🔍 MOTOR DE BÚSQUEDA (Full-Text Scan Básico)
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
        OR p.sector ILIKE '%' || search_query || '%'
    )
    -- 🛡️ RADIO ESTRICTO (GEOFENCING): El index de PostGIS hace que esto vuele (O(log n))
    AND ST_DWithin(
        p.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000
    )
    ORDER BY distancia_mts ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 3. Cierre de Brechas (Solo autenticados pueden usar el radar, anon NO DEBE raspar nuestra DB)
REVOKE EXECUTE ON FUNCTION public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer) TO authenticated;

COMMIT;

-- 4. Notificar a PostgREST para que refresque el esquema inmediatamente
NOTIFY pgrst, 'reload schema';
