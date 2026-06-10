-- 📦 9_create_storage_bucket.sql
-- Crea un Bucket público para subir imágenes (Logo, Avatares, etc.)

BEGIN;

-- 1. Crear Bucket 'assets' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Seguridad (RLS) para el Bucket
-- Permitir acceso público a todos para VER (SELECT)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING ( bucket_id = 'assets' );

-- Permitir a usuarios autenticados SUBIR archivos (INSERT)
CREATE POLICY "Auth Users Upload" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'assets' 
    AND auth.role() = 'authenticated'
);

-- (Opcional) Permitir UPDATE/DELETE solo al dueño
CREATE POLICY "Users Update Own Files" ON storage.objects
FOR UPDATE
USING (bucket_id = 'assets' AND auth.uid() = owner);

COMMIT;
