-- 🛠️ 17_fix_vacantes_empresas_relationship.sql
-- Este script soluciona el error: "Could not find a relationship between 'vacantes' and 'empresas'"
-- Además sincroniza las columnas que el Frontend espera recibir.

BEGIN;

-- 1. CORREGIR EL FOREIGN KEY
-- Actualmente 'empresa_id' apunta a 'auth.users', lo que impide el join directo con 'public.empresas'.
ALTER TABLE public.vacantes 
DROP CONSTRAINT IF EXISTS vacantes_empresa_id_fkey;

-- 🔥 CLEANUP MANDATORIO: Eliminar vacantes que no tengan un registro de empresa válido
-- Esto evita el error 23503 (FK Violation) al intentar crear la relación.
DELETE FROM public.vacantes 
WHERE empresa_id NOT IN (SELECT id FROM public.empresas);

ALTER TABLE public.vacantes 
ADD CONSTRAINT vacantes_empresa_id_fkey 
FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) 
ON DELETE CASCADE;

-- 2. AGREGAR COLUMNAS FALTANTES A EMPRESAS
-- El frontend busca estos campos para renderizar el logo y el check de verificación.
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS verificado boolean DEFAULT false;

-- 3. POBLAR DATOS PARA PRUEBAS
UPDATE public.empresas 
SET logo_url = 'https://portal.turnes.co/logo-placeholder.png'
WHERE logo_url IS NULL;

COMMIT;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Relación vacantes-empresas corregida y columnas sincronizadas tras limpieza de huérfanos.';
END $$;
