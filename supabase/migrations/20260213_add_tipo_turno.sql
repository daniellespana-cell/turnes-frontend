-- 🚨 20260213_add_tipo_turno.sql
-- PROPÓSITO: Agregar columna 'tipo_turno' a la tabla 'vacantes'.
-- RAZÓN: Frontend lo requiere para el Dashboard de Candidatos.

BEGIN;

-- 1. Crear Enum si no existe (opcional, por ahora usaremos TEXT para flexibilidad o CHECK)
-- CREATE TYPE tipo_turno_enum AS ENUM ('Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Fin de Semana');

-- 2. Agregar columna con default
ALTER TABLE public.vacantes
ADD COLUMN IF NOT EXISTS tipo_turno text DEFAULT 'Tiempo Completo';

-- 3. Actualizar registros existentes (Si los hay)
UPDATE public.vacantes
SET tipo_turno = 'Tiempo Completo'
WHERE tipo_turno IS NULL;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ Columna tipo_turno agregada a vacantes.';
END $$;
