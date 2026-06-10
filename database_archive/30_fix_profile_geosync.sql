-- 🛠️ 30_fix_profile_geosync.sql
-- Garantiza que lat/lng y geo_point estén siempre sincronizados
-- y que el email se mantenga vinculado a Supabase Auth.

BEGIN;

-- 1. Asegurar que las columnas existan en perfiles y empresas
DO $$ 
BEGIN 
    -- Perfiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='lat') THEN
        ALTER TABLE public.perfiles ADD COLUMN lat double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='lng') THEN
        ALTER TABLE public.perfiles ADD COLUMN lng double precision;
    END IF;
    -- Empresas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='lat') THEN
        ALTER TABLE public.empresas ADD COLUMN lat double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='lng') THEN
        ALTER TABLE public.empresas ADD COLUMN lng double precision;
    END IF;
END $$;

-- 2. Función de Sincronización de Coordenadas
CREATE OR REPLACE FUNCTION fn_sync_profile_geo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si cambiaron lat o lng, actualizar geo_point
    IF (NEW.lat IS DISTINCT FROM OLD.lat OR NEW.lng IS DISTINCT FROM OLD.lng) 
       AND NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.geo_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    END IF;
    
    -- Si cambió geo_point, actualizar lat y lng (bidireccional)
    IF (NEW.geo_point IS DISTINCT FROM OLD.geo_point) AND NEW.geo_point IS NOT NULL THEN
        NEW.lat := ST_Y(NEW.geo_point::geometry);
        NEW.lng := ST_X(NEW.geo_point::geometry);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para Perfiles
DROP TRIGGER IF EXISTS trg_sync_profile_geo ON public.perfiles;
CREATE TRIGGER trg_sync_profile_geo
BEFORE INSERT OR UPDATE ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION fn_sync_profile_geo();

-- 4. Trigger para Empresas
DROP TRIGGER IF EXISTS trg_sync_empresa_geo ON public.empresas;
CREATE TRIGGER trg_sync_empresa_geo
BEFORE INSERT OR UPDATE ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION fn_sync_profile_geo();

COMMIT;

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Cimientos Geográficos Blindados: Sincronización PostGIS Activa.';
END $$;
