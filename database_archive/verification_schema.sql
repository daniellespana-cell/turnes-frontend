-- 1. Habilitar columna para el PLAN (si no existe)
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Básico';

-- 2. Habilitar columna para VERIFICACIÓN (Check Azul)
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- 3. (Opcional) Asegurar permisos para que el usuario pueda editar su propio perfil
-- Esto permite que desde el frontend (AuthContext) podamos hacer el update del plan.
-- Ajusta el nombre de la política según tu configuración actual en Supabase.

-- CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
-- ON public.perfiles FOR UPDATE 
-- USING (auth.uid() = id);

-- 4. Comentario: 
-- Ejecuta este script en el editor SQL de Supabase para habilitar las funcionalidades Premium.
