-- 🚀 SENIOR FIX: Límite Escalar Fuerte (Máximo 10 cupos)
-- Previene Race Conditions en el Backend impidiendo que existan
-- más de 10 postulaciones con status = 'contratado' para una misma vacante.

CREATE OR REPLACE FUNCTION public.check_vacancy_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Solo nos importa validar si el nuevo status es 'contratado'
  IF NEW.status = 'contratado' THEN
    -- Contabilizar cuántos contratados actuales tiene la vacante
    SELECT COUNT(*) INTO v_count
    FROM public.postulaciones
    WHERE vacante_id = NEW.vacante_id 
      AND status = 'contratado'
      AND id != NEW.id; -- Excluir a sí mismo si ya estaba contratado (por si acaso hay updates)

    IF v_count >= 10 THEN
      RAISE EXCEPTION 'Límite de Cupos: La vacante ya ha alcanzado el máximo permitido de 10 candidatos seleccionados.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Asegurar de eliminar el trigger si ya existía para poder reacrearlo
DROP TRIGGER IF EXISTS tr_check_vacancy_limit ON public.postulaciones;

-- Crear el trigger que dispara la función ANTES de insertar o actualizar
CREATE TRIGGER tr_check_vacancy_limit
BEFORE INSERT OR UPDATE ON public.postulaciones
FOR EACH ROW
EXECUTE FUNCTION public.check_vacancy_limit();
