-- 🚨 20260213_add_calificacion.sql
-- PROPÓSITO: Agregar columna 'calificacion' a la tabla 'perfiles'.
-- RAZÓN: Frontend lo requiere para mostrar la reputación del candidato.

BEGIN;

-- 1. Agregar columna
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS calificacion numeric(3, 1) DEFAULT 5.0;

-- 2. Asegurar constraints (0.0 a 5.0)
ALTER TABLE public.perfiles
ADD CONSTRAINT check_calificacion_range CHECK (calificacion >= 0.0 AND calificacion <= 5.0);

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ Columna calificacion agregada a perfiles.';
END $$;
