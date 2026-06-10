-- 🛰️ 19_postgis_setup.sql
-- OBJETIVO: Habilitar inteligencia espacial en Turnes V2.
-- Mueve el filtrado de distancia del móvil al servidor para máxima escalabilidad.

BEGIN;

-- 1. HABILITAR EXTENSIÓN POSTGIS (Si no existe)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
-- Nota: En Supabase 'extensions' suele ser el schema donde vive PostGIS.
-- Aseguramos visibilidad en el search_path si es necesario.
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- 2. AGREGAR COLUMNAS GEOGRÁFICAS
ALTER TABLE public.vacantes 
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lng double precision,
ADD COLUMN IF NOT EXISTS geo_point geography(POINT, 4326);

ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lng double precision,
ADD COLUMN IF NOT EXISTS geo_point geography(POINT, 4326);

-- 3. TRIGGER PARA SINCRONIZACIÓN AUTOMÁTICA
-- Cada vez que cambie lat/lng (float), actualizamos geo_point (geography).
CREATE OR REPLACE FUNCTION public.sync_vacante_geo()
RETURNS trigger AS $$
BEGIN
    IF (NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL) THEN
        NEW.geo_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_vacante_geo ON public.vacantes;
CREATE TRIGGER trg_sync_vacante_geo
    BEFORE INSERT OR UPDATE OF lat, lng ON public.vacantes
    FOR EACH ROW EXECUTE FUNCTION public.sync_vacante_geo();

-- Agregar Trigger para Perfiles
CREATE OR REPLACE FUNCTION public.sync_perfil_geo()
RETURNS trigger AS $$
BEGIN
    IF (NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL) THEN
        NEW.geo_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_perfil_geo ON public.perfiles;
CREATE TRIGGER trg_sync_perfil_geo
    BEFORE INSERT OR UPDATE OF lat, lng ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_perfil_geo();

-- 4. MIGRAR DATOS EXISTENTES
UPDATE public.vacantes 
SET geo_point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE lat IS NOT NULL AND lng IS NOT NULL;

UPDATE public.perfiles
SET geo_point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- 5. RPC: BÚSQUEDA ESPACIAL (buscar_vacantes_cercanas)
-- Esta función será llamada desde el Frontend vía supabase.rpc()
CREATE OR REPLACE FUNCTION buscar_vacantes_cercanas(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    titulo text,
    descripcion text,
    pago_monto numeric,
    modalidad text,
    categoria text,
    lat double precision,
    lng double precision,
    distancia_mts float,
    created_at timestamptz,
    empresa_nombre_comercial text,
    empresa_logo_url text,
    empresa_verificado boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.titulo,
        v.descripcion,
        v.pago_monto,
        v.modalidad,
        v.categoria,
        v.lat,
        v.lng,
        ST_Distance(v.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        v.created_at,
        e.nombre_comercial,
        e.logo_url,
        e.verificado
    FROM public.vacantes v
    JOIN public.empresas e ON e.id = v.empresa_id
    WHERE v.status = 'activa'
    AND ST_DWithin(
        v.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000 -- Convertimos KM a Metros
    )
    ORDER BY distancia_mts ASC;
END;
$$;

-- 6. RPC: BÚSQUEDA DE TALENTO (buscar_talento_cercano)
-- Permite a las empresas encontrar trabajadores cerca de su ubicación con filtrado por texto/skills.
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
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    AND ST_DWithin(
        p.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000
    )
    ORDER BY distancia_mts ASC;
END;
$$;

-- 7. PERMISOS DE EJECUCIÓN
GRANT EXECUTE ON FUNCTION buscar_talento_cercano(double precision, double precision, double precision, text) TO authenticated;
GRANT EXECUTE ON FUNCTION buscar_vacantes_cercanas(double precision, double precision, double precision) TO anon, authenticated;

COMMIT;

-- Aviso Final
DO $$
BEGIN
    RAISE NOTICE '✅ PostGIS habilitado, RPCs creados (Vacantes + Talento) y permisos concedidos.';
END $$;
