-- 📦 PASO 1: AÑADIR LA NUEVA COLUMNA DE CANCELACIÓN A LA BASE DE DATOS
-- Ejecutar en SQL Editor de Supabase
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;
