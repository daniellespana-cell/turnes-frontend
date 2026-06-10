-- 🛡️ SSOT GEOLOCATION AUTOPILOT (Kernel Level)
-- Resuelve el "Efecto Valledupar" convirtiendo texto a matemáticas espaciales.

BEGIN;

-- 1. FUNCIÓN INTERCEPTORA (TRIGGER FUNCTION)
CREATE OR REPLACE FUNCTION fn_auto_geocode_profile()
RETURNS TRIGGER AS $$
DECLARE
    ciudad_coord RECORD;
    direccion_cambiada BOOLEAN;
BEGIN
    -- Detectar si la dirección cambió realmente
    direccion_cambiada := (TG_OP = 'INSERT') OR (NEW.direccion IS DISTINCT FROM OLD.direccion);

    -- Si la dirección es válida y (cambió de ciudad o no tiene GPS exacto)
    IF NEW.direccion IS NOT NULL AND trim(NEW.direccion) != '' AND (direccion_cambiada OR NEW.geo_point IS NULL) THEN
        
        SELECT lat, lng INTO ciudad_coord 
        FROM public.ciudades_coords 
        WHERE nombre_lower = lower(trim(NEW.direccion))
        LIMIT 1;

        IF FOUND THEN
            -- Autocompletar solo para tener la base matemática
            NEW.lat := ciudad_coord.lat;
            NEW.lng := ciudad_coord.lng;
            NEW.geo_point := ST_SetSRID(ST_MakePoint(ciudad_coord.lng, ciudad_coord.lat), 4326)::geography;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. EL TRIGGER
DROP TRIGGER IF EXISTS tr_auto_geocode_profile ON public.perfiles;

CREATE TRIGGER tr_auto_geocode_profile
BEFORE INSERT OR UPDATE OF direccion, geo_point
ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION fn_auto_geocode_profile();


-- 3. 🚑 SANACIÓN HISTÓRICA MASIVA
DO $$
DECLARE
    cur_perfil RECORD;
    ciudad_coord RECORD;
    rows_healed INT := 0;
BEGIN
    FOR cur_perfil IN 
        SELECT id, direccion 
        FROM public.perfiles 
        WHERE direccion IS NOT NULL 
          AND trim(direccion) != '' 
          AND geo_point IS NULL
    LOOP
        SELECT lat, lng INTO ciudad_coord 
        FROM public.ciudades_coords 
        WHERE nombre_lower = lower(trim(cur_perfil.direccion))
        LIMIT 1;

        IF FOUND THEN
            UPDATE public.perfiles
            SET 
                lat = ciudad_coord.lat,
                lng = ciudad_coord.lng,
                geo_point = ST_SetSRID(ST_MakePoint(ciudad_coord.lng, ciudad_coord.lat), 4326)::geography
            WHERE id = cur_perfil.id;
            
            rows_healed := rows_healed + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🔥 Sanación Histórica Completada: % perfiles sin GPS fueron auto-geolocalizados.', rows_healed;
END $$;


-- 4. 🔒 ELIMINAR EL BYPASS DEL RADAR (Cierre de la Brecha Final)
-- Si un usuario escribe una ciudad que NO existe en la base de datos (ej. "PueblitoX"), su geo_point quedará NULL.
-- Debemos asegurarnos de que el radar NO perdone los NULL, o volverá a colarse a nivel nacional.
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
    completed_shifts int,
    sector text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.nombre_display, p.bio, p.skills, p.avatar_url, p.lat, p.lng,
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts,
        p.verificado, p.rating, p.completed_shifts, p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid()
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    -- 🛑 SE CIERRA LA BRECHA: Ya no hay "OR p.geo_point IS NULL". 
    -- Solo se muestran si están dentro del radio geográfico real.
    AND p.geo_point IS NOT NULL
    AND ST_DWithin(
        p.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000
    )
    ORDER BY distancia_mts ASC;
END;
$$;

COMMIT;
