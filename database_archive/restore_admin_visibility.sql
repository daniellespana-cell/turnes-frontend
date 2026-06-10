-- ==============================================================================
-- TURNES: RESTAURACIÃ“N DE VISIBILIDAD ADMIN (FIX RLS)
-- Soluciona el problema de "Verificaciones Pendientes: 0" en el Dashboard Admin
-- ==============================================================================

BEGIN;

-- 1. Restaurar visibilidad sobre la tabla verification_requests
DROP POLICY IF EXISTS "Admin full access" ON public.verification_requests;
CREATE POLICY "Admin full access"
    ON public.verification_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 2. Restaurar visibilidad sobre los buckets de Supabase Storage para descargar Docs
DROP POLICY IF EXISTS "Admin reads all docs" ON storage.objects;
CREATE POLICY "Admin reads all docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-docs' AND
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

COMMIT;


-- 3. FIX: Relación Supabase/PostgREST para Joins
-- Supabase JS necesita que la FK apunte a public.perfiles en lugar de auth.users para poder hacer joins.
ALTER TABLE public.verification_requests 
  DROP CONSTRAINT IF EXISTS verification_requests_user_id_fkey;

ALTER TABLE public.verification_requests 
  ADD CONSTRAINT verification_requests_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;


-- 4. RECARGAR CACHE DE SUPABASE API
-- Esto fuerza a PostgREST a reconocer la nueva llave foránea inmediatamente
NOTIFY pgrst, 'reload schema';

