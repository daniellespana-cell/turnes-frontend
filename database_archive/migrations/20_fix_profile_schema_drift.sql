-- 🛠️ 20_fix_profile_schema_drift.sql
-- OBJETIVO: Sincronizar el Schema de la DB con la arquitectura "Senior 2026".
-- Agrega columnas faltantes requeridas por authService.getProfile, useProfileLogic y useDashboardMetrics.

BEGIN;

-- 1. ACTUALIZAR TABLA PERFILES
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS disponibilidad TEXT,
ADD COLUMN IF NOT EXISTS experiencia_anios INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS completed_shifts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;

-- Manejo de Migración: Si existía 'verified', pasamos la data a 'verificado'
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='perfiles' AND column_name='verified') THEN
        UPDATE public.perfiles SET verificado = verified WHERE verificado IS FALSE;
    END IF;
END $$;

-- 2. ACTUALIZAR TABLA EMPRESAS
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS sector_industrial TEXT,
ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;

-- 3. ACTUALIZAR TABLA VACANTES
-- Requerido para useDashboardMetrics.js
ALTER TABLE public.vacantes
ADD COLUMN IF NOT EXISTS contratado_id UUID REFERENCES auth.users(id);

COMMIT;

-- Aviso de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Schema sincronizado: Columnas de perfil, empresa y vacante agregadas exitosamente.';
END $$;
