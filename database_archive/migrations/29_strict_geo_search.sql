-- 🛰️ 29_strict_geo_search.sql
-- OBJETIVO: Erradicar deuda técnica de ubicación. Implementar Zero-Trust Location.
-- Elimina resultados fantasma (coordenadas NULL) y fuerza paginación estricta.

BEGIN;

-- 1. DROP DE LAS FUNCIONES ANTERIORES
-- Es necesario hacer DROP porque vamos a cambiar la firma de la función (añadir p_limit, p_offset).
DROP FUNCTION IF EXISTS buscar_talento_cercano(double precision, double precision, double precision, text);
DROP FUNCTION IF EXISTS buscar_vacantes_cercanas(double precision, double precision, double precision);

-- 2. RECREAR BÚSQUEDA DE TALENTO (Con Single Source of Truth Espacial)
CREATE OR REPLACE FUNCTION buscar_talento_cercano(
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
AS $$
BEGIN
    -- 🛑 ZERO-TRUST: Si la empresa buscando no tiene coordenadas válidas, retornar vacío.
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
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        p.verificado,
        p.rating,
        p.completed_shifts,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    -- 🛑 REGLA DE HIERRO: El talento DEBE tener ubicación real. Cero fantasmas.
    AND p.lat IS NOT NULL 
    AND p.lng IS NOT NULL
    AND p.geo_point IS NOT NULL
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    -- 🔥 RADIO ESTRICTO: Nadie entra si está a +1 milímetro del radio.
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

-- 3. PERMISOS DE EJECUCIÓN ESTRICTOS
GRANT EXECUTE ON FUNCTION buscar_talento_cercano(double precision, double precision, double precision, text, integer, integer) TO authenticated;

COMMIT;

-- Aviso Final
DO $$
BEGIN
    RAISE NOTICE '✅ Arquitectura Espacial Estricta (V3) implementada. Zero-Trust Location activo.';
END $$;
