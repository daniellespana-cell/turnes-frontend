-- ==============================================================================
-- 35_create_blogs_schema.sql
-- DESCRIPTION: Tabla 'blogs', rol 'editor' y bucket 'blog-covers'.
-- Implementa RBAC (Role-Based Access Control) con aislamiento entre Admin y Editor.
-- ==============================================================================

-- 0. EXTENDER ENUM DE ROLES CON 'editor' (Marketing & Contenidos)
ALTER TYPE public.rol_usuario_enum ADD VALUE IF NOT EXISTS 'editor';

-- 1. CREACIÓN DE LA TABLA BLOGS
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'todos' CHECK (category IN ('todos', 'talento', 'empresas', 'guias')),
    category_name TEXT DEFAULT 'Artículos y Guías',
    read_time TEXT DEFAULT '5 min de lectura',
    publish_date TEXT DEFAULT to_char(now(), 'DD "de" TMMonth, YYYY'),
    author JSONB NOT NULL DEFAULT '{"name": "Equipo Editorial Turnes", "role": "Especialistas en Operaciones", "avatar": "/avatar-carlos.webp"}'::jsonb,
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    hero_subtitle TEXT,
    cover_url TEXT,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON public.blogs(featured) WHERE featured = true;

-- 3. TRIGGER DE ACTUALIZACIÓN DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.tr_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_blogs_set_updated_at ON public.blogs;
CREATE TRIGGER tr_blogs_set_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.tr_blogs_updated_at();

-- 4. SEGURIDAD A NIVEL DE FILA (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura pública (Cualquier visitante puede ver artículos publicados)
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
ON public.blogs
FOR SELECT
USING (status = 'published');

-- Política 2: Admins y Editores de Marketing tienen control total (Borradores, Crear, Editar, Eliminar)
DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins and editors have full access to blogs" ON public.blogs;
CREATE POLICY "Admins and editors have full access to blogs"
ON public.blogs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE perfiles.id = auth.uid()
          AND perfiles.rol IN ('admin', 'editor')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE perfiles.id = auth.uid()
          AND perfiles.rol IN ('admin', 'editor')
    )
);

-- 5. CREACIÓN DEL STORAGE BUCKET 'blog-covers'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-covers',
    'blog-covers',
    true,
    5242880, -- 5 MB límite
    ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- Políticas de Storage para 'blog-covers'
DROP POLICY IF EXISTS "Public can view blog covers" ON storage.objects;
CREATE POLICY "Public can view blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

DROP POLICY IF EXISTS "Admins can upload blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload blog covers" ON storage.objects;
CREATE POLICY "Admins and editors can upload blog covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'blog-covers' AND
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE perfiles.id = auth.uid()
          AND perfiles.rol IN ('admin', 'editor')
    )
);

DROP POLICY IF EXISTS "Admins can delete blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete blog covers" ON storage.objects;
CREATE POLICY "Admins and editors can delete blog covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'blog-covers' AND
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE perfiles.id = auth.uid()
          AND perfiles.rol IN ('admin', 'editor')
    )
);
