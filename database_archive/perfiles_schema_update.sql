-- 🛠️ ACTUALIZACIÓN DE SCHEMA: PERFILES (Turnes V2)
-- Ejecutar en el Editor SQL de Supabase para soportar el formulario de perfil completo

-- Agregar columnas faltantes en tabla 'perfiles'
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT,
ADD COLUMN IF NOT EXISTS nit TEXT,
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[], -- Array de textos para habilidades
ADD COLUMN IF NOT EXISTS on_vacation BOOLEAN DEFAULT FALSE;

-- Índices opcionales
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);

-- Comentarios
COMMENT ON COLUMN public.perfiles.nombre_empresa IS 'Nombre comercial si el usuario es una empresa';
COMMENT ON COLUMN public.perfiles.skills IS 'Lista de habilidades o tags del usuario';
