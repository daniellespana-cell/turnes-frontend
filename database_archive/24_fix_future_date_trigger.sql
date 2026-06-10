-- 🚀 FIX: Evitar que el trigger bloquee actualizaciones lógicas a vacantes antiguas.
-- El trigger original bloqueaba cualquier UPDATE (ej: cerrar vacante) si la fecha del turno ya había pasado.
-- Ahora solo valida en INSERT o si la fecha_turno ha sido modificada explícitamente.

-- NOTA IMPORTANTE: Para acceder a `OLD` en PostgreSQL de forma segura dentro del IF, debemos validar TG_OP.

CREATE OR REPLACE FUNCTION public.check_vacancy_future_date()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Si es una inserción, o si es actualización y la fecha del turno cambió
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.fecha_turno IS DISTINCT FROM OLD.fecha_turno) THEN
      IF NEW.fecha_turno::date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Límite de Tiempo: No se pueden crear vacantes para fechas en el pasado.';
      END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Asegurar de eliminar el trigger si ya existía para mantener limpieza
DROP TRIGGER IF EXISTS tr_check_vacancy_future_date ON public.vacantes;

-- Re-crear el trigger
CREATE TRIGGER tr_check_vacancy_future_date
BEFORE INSERT OR UPDATE ON public.vacantes
FOR EACH ROW
EXECUTE FUNCTION public.check_vacancy_future_date();
