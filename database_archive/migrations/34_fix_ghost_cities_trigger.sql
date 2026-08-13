-- 🚀 FIX: Sincronización Espacial Absoluta (Zero Ghost Data)
-- Este script arregla el trigger que mantenía viva a Bucaramanga cuando borrabas tu perfil.

CREATE OR REPLACE FUNCTION public.sync_perfil_geo()
RETURNS trigger AS $$
BEGIN
    -- Si hay coordenadas válidas, actualizar el geo_point
    IF (NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL) THEN
        NEW.geo_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    ELSE
        -- Si borran la ubicación (lat o lng son null), DESTRUIR el geo_point
        -- Esto saca automáticamente a la empresa del Radar Talent de esa ciudad.
        NEW.geo_point := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notificación de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger de PostGIS actualizado. Adiós a las ciudades fantasma.';
END $$;
