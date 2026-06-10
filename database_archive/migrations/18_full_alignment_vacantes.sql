-- 🛠️ 18_full_alignment_vacantes.sql
-- OBJETIVO: Sincronizar la tabla vacantes con el Modelo de Negocio de Turnes V2.
-- Soporta: Modalidades (Fijo/Temporal), Geoposicionamiento, Pagos y Categorías.

BEGIN;

-- 1. LIMPIEZA Y SEGURIDAD (Relaciones)
-- Aseguramos que empresa_id sea un FK válido a la tabla empresas.
ALTER TABLE public.vacantes DROP CONSTRAINT IF EXISTS vacantes_empresa_id_fkey;

DELETE FROM public.vacantes WHERE empresa_id NOT IN (SELECT id FROM public.empresas);

ALTER TABLE public.vacantes 
ADD CONSTRAINT vacantes_empresa_id_fkey 
FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;

-- 2. AMPLIACIÓN DEL ESQUEMA: VACANTES
-- Agregamos las columnas que el Frontend está intentando guardar/leer.
ALTER TABLE public.vacantes 
ADD COLUMN IF NOT EXISTS modalidad text CHECK (modalidad IN ('temporal', 'fijo')),
ADD COLUMN IF NOT EXISTS pago_monto numeric(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'VARIOS',
ADD COLUMN IF NOT EXISTS fecha_turno timestamptz,
ADD COLUMN IF NOT EXISTS direccion_formateada text,
ADD COLUMN IF NOT EXISTS es_urgente boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cupos_disponibles int DEFAULT 1,
ADD COLUMN IF NOT EXISTS tags text[];

-- Renombrar 'salario' a 'pago_monto' si existe salario y no pago_monto (para migración suave)
-- DO $$ 
-- BEGIN 
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vacantes' AND column_name='salario') THEN
--     ALTER TABLE public.vacantes RENAME COLUMN salario TO salario_legacy;
--   END IF;
-- END $$;

-- 3. AMPLIACIÓN DEL ESQUEMA: EMPRESAS
-- Datos de branding necesarios para el Feed.
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS verificado boolean DEFAULT false;

-- 4. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_vacantes_modalidad ON public.vacantes(modalidad);
CREATE INDEX IF NOT EXISTS idx_vacantes_categoria ON public.vacantes(categoria);
CREATE INDEX IF NOT EXISTS idx_vacantes_geo ON public.vacantes(lat, lng);

COMMIT;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Alineación Completa: La base de datos ahora soporta el Modelo de Negocio Turnes V2.';
END $$;
