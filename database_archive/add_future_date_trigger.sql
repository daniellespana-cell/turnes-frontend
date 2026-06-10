-- 🚀 SENIOR FIX: Evitar vacantes en el pasado
-- Trigger que valida que la fecha del turno sea mayor o igual a la fecha actual
-- (considerando la zona horaria del servidor / UTC).

CREATE OR REPLACE FUNCTION public.check_vacancy_future_date()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validar que fecha_turno no esté en el pasado
  -- Se castea CURRENT_DATE a texto 'YYYY-MM-DD' o se compara directamente si el campo es de tipo date.
  -- Asumiendo que fecha_turno es tipo Date o Text con formato YYYY-MM-DD:
  
  IF NEW.fecha_turno::date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Límite de Tiempo: No se pueden crear vacantes para fechas en el pasado.';
  END IF;

  RETURN NEW;
END;
$function$;

-- Asegurar de eliminar el trigger si ya existía
DROP TRIGGER IF EXISTS tr_check_vacancy_future_date ON public.vacantes;

-- Crear el trigger que dispara la función ANTES de insertar o actualizar
CREATE TRIGGER tr_check_vacancy_future_date
BEFORE INSERT OR UPDATE ON public.vacantes
FOR EACH ROW
EXECUTE FUNCTION public.check_vacancy_future_date();
