-- ==========================================
-- 1. CONFIGURACIÓN DE ROLES (ENUMS)
-- ==========================================
-- Aseguramos que los tipos de usuario sean estrictos
DO $$ BEGIN
    CREATE TYPE public.rol_usuario_enum AS ENUM ('postulante', 'empresa', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE public.rol_usuario_enum ADD VALUE IF NOT EXISTS 'usuario'; -- Compatibilidad legacy

-- ==========================================
-- 2. TABLAS BASE (Perfiles y Empresas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  rol public.rol_usuario_enum DEFAULT 'postulante',
  nombre_completo text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.empresas (
    id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_comercial text,
    created_at timestamptz DEFAULT now()
);

-- Habilitar RLS (El Candado) en ambas tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. TRIGGER AUTOMÁTICO (El Cerebro del Registro)
-- ==========================================
-- Función blindada que maneja la creación del usuario desde Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  rol_input text;
  v_company_name text;
BEGIN
  -- Normalizamos el rol a minúsculas y aseguramos un valor por defecto
  rol_input := LOWER(COALESCE(new.raw_user_meta_data->>'rol', 'postulante'));
  v_company_name := new.raw_user_meta_data->>'company_name';

  -- 1. Insertar Perfil
  INSERT INTO public.perfiles (id, email, rol, nombre_display)
  VALUES (
    new.id, 
    new.email, 
    CASE 
      WHEN rol_input = 'empresa' THEN 'empresa'::public.rol_usuario_enum
      WHEN rol_input = 'admin' THEN 'admin'::public.rol_usuario_enum
      ELSE 'postulante'::public.rol_usuario_enum
    END,
    COALESCE(new.raw_user_meta_data->>'full_name', v_company_name, split_part(new.email, '@', 1))
  );

  -- 2. Insertar Empresa (Si aplica)
  IF rol_input = 'empresa' THEN
      INSERT INTO public.empresas (id, nombre_comercial, nit_rut)
      VALUES (
          new.id,
          COALESCE(v_company_name, 'Empresa Sin Nombre'),
          COALESCE(new.raw_user_meta_data->>'nit', 'PENDIENTE')
      );
  END IF;

  -- 3. Crear Billetera (Vital para pagos)
  INSERT INTO public.billeteras (id, saldo)
  VALUES (new.id, 0);

  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reiniciamos el Trigger para asegurar que use la última versión
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 4. POLÍTICAS DE SEGURIDAD (Las Llaves RLS)
-- ==========================================
-- Limpieza de políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Ver perfil propio" ON public.perfiles;
DROP POLICY IF EXISTS "Editar perfil propio" ON public.perfiles;
DROP POLICY IF EXISTS "Ver mi empresa" ON public.empresas;
DROP POLICY IF EXISTS "Editar mi empresa" ON public.empresas;
DROP POLICY IF EXISTS "Crear mi empresa" ON public.empresas;

-- Políticas para PERFILES
CREATE POLICY "Ver perfil propio"
ON public.perfiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

CREATE POLICY "Editar perfil propio"
ON public.perfiles FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

-- Políticas para EMPRESAS
-- Permite que el frontend haga consultas JOIN sin error 403
CREATE POLICY "Ver mi empresa"
ON public.empresas FOR SELECT
TO authenticated
USING ( auth.uid() = id );

CREATE POLICY "Editar mi empresa"
ON public.empresas FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

CREATE POLICY "Crear mi empresa"
ON public.empresas FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );

-- Permisos finales
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
