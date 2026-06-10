-- 🚀 29_match_notification_engine.sql
-- AUTOMATED MATCH NOTIFICATION SYSTEM
-- Implementa un motor "Zero-Latency" puramente en Postgres para cruzar habilidades y distancias (< 30km)

BEGIN;

-- 1. Función Principal del Motor de Match
CREATE OR REPLACE FUNCTION fn_notify_matching_candidates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos elevados para poder leer perfiles e insertar notificaciones
AS $$
DECLARE
    v_candidato_count INT := 0;
BEGIN
    -- Evitar ejecuciones si no hay coordenadas
    IF NEW.lat IS NULL OR NEW.lng IS NULL THEN
        RETURN NEW;
    END IF;

    -- Solo disparar si la vacante se acaba de crear como activa, o se activó desde otro estado
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'activa' OR NEW.status != 'activa' THEN
            RETURN NEW;
        END IF;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.status != 'activa' THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Cruzar datos pesados e insertar notificaciones masivas de forma atómica
    INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
    SELECT 
        p.id,
        'NEW_JOB_ZONE'::text,
        NEW.id,
        jsonb_build_object(
            'companyName', coalesce((SELECT nombre_comercial FROM public.empresas WHERE id = NEW.empresa_id), 'Una empresa'),
            'jobTitle', coalesce(NEW.titulo, 'profesional'),
            'matchScore', match_data.score,
            'candidateId', p.id, -- ✅ Para que la empresa vea al talento
            'entityId', NEW.id    -- ✅ Para que el talento vea la vacante específica
        )
    FROM public.perfiles p
    JOIN public.ciudades_coords c ON c.nombre_lower = lower(trim(p.direccion)),
    LATERAL (
        SELECT (
            -- 🧠 ALGORITMO DE SCORE (SQL Mirror de MatchService)
            (CASE WHEN p.sector = NEW.categoria THEN 40 ELSE 0 END) + -- Categoría Base
            (CASE WHEN NEW.etiquetas && p.skills THEN 40 ELSE 0 END) + -- Habilidades
            (CASE WHEN p.verificado THEN 10 ELSE 0 END) + -- Reputación
            (CASE WHEN (
                6371 * acos(least(1.0, greatest(-1.0,
                    cos(radians(NEW.lat)) * cos(radians(c.lat)) *
                    cos(radians(c.lng) - radians(NEW.lng)) +
                    sin(radians(NEW.lat)) * sin(radians(c.lat))
                )))
            ) <= 10 THEN 10 ELSE 5 END) -- Cercanía
        ) as score
    ) as match_data
    WHERE p.rol = 'postulante'
      AND c.lat IS NOT NULL
      AND match_data.score >= 90 -- 🚀 UMBRAL DE CALIDAD: Solo notificar si el match es de élite
    LIMIT 500;

    GET DIAGNOSTICS v_candidato_count = ROW_COUNT;
    RAISE LOG 'Match Engine: Notificados % candidatos para vacante %', v_candidato_count, NEW.id;

    RETURN NEW;
END;
$$;

-- 2. Conectar el Trigger a la tabla de Vacantes
DROP TRIGGER IF EXISTS trg_notify_matching_candidates ON public.vacantes;

CREATE TRIGGER trg_notify_matching_candidates
AFTER INSERT OR UPDATE ON public.vacantes
FOR EACH ROW
EXECUTE FUNCTION fn_notify_matching_candidates();

COMMIT;

-- Mensaje de validación
DO $$
BEGIN
    RAISE NOTICE '✅ Match Notification Engine instalado exitosamente.';
END $$;
