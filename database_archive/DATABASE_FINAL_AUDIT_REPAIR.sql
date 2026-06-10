-- 🛡️ TURNES DATABASE KERNEL REPAIR
-- OBJETIVO: Eliminar discrepancias de rating (3.8 vs 4.4) a nivel de motor.

BEGIN;

-- 1. LIMPIEZA DE COLUMNAS "MAQUILLADAS"
-- Eliminamos el 5.0 de los valores por defecto de la tabla perfiles.
ALTER TABLE public.perfiles ALTER COLUMN rating SET DEFAULT 0.0;
ALTER TABLE public.perfiles ALTER COLUMN calificacion SET DEFAULT 0.0;

-- 2. FUNCIÓN MAESTRA DE SINCRONIZACIÓN (LA ÚNICA VERDAD)
CREATE OR REPLACE FUNCTION public.rpc_sync_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_rating NUMERIC;
    v_exitos INTEGER;
BEGIN
    -- Cálculo aritmético puro desde la tabla de reseñas (La Verdad)
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) 
    INTO v_rating
    FROM public.reviews 
    WHERE target_id = p_user_id;

    -- Conteo de éxitos reales
    SELECT COUNT(*) INTO v_exitos 
    FROM public.postulaciones 
    WHERE user_id = p_user_id AND status = 'finalizado';

    -- Actualización forzosa en todas las columnas sospechosas
    UPDATE public.perfiles 
    SET 
        rating = v_rating, 
        calificacion = v_rating, 
        completed_shifts = v_exitos,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER GLOBAL DE INTEGRIDAD
-- Cada vez que se inserta, actualiza o borra una reseña, se recalcula el perfil.
CREATE OR REPLACE FUNCTION public.trigger_sync_reviews()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.rpc_sync_user_stats(OLD.target_id);
        RETURN OLD;
    ELSE
        PERFORM public.rpc_sync_user_stats(NEW.target_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_reviews_on_change ON public.reviews;
CREATE TRIGGER tr_sync_reviews_on_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trigger_sync_reviews();

-- 4. REPARACIÓN DE LA RPC DE BÚSQUEDA (EL RADAR)
-- Forzamos que el radar use el rating que el trigger mantiene fresco.
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
) AS $$
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
        COALESCE(p.rating, 0.0) as rating, -- Confiamos en p.rating porque el trigger lo cuida
        COALESCE(p.completed_shifts, 0) as exitos,
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid()
    AND (search_query = '' OR p.nombre_display ILIKE '%' || search_query || '%' OR p.skills::text ILIKE '%' || search_query || '%')
    AND (p.geo_point IS NULL OR ST_DWithin(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radio_km * 1000))
    ORDER BY distancia_mts ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SINCRONIZACIÓN MASIVA INICIAL
-- Ejecutamos la verdad para todos los usuarios existentes ahora mismo.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.perfiles LOOP
        PERFORM public.rpc_sync_user_stats(r.id);
    END LOOP;
END $$;

COMMIT;
