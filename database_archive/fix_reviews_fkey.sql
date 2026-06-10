-- 🛠️ HOTFIX: Añadiendo Foreign Keys faltantes a la tabla Reviews
-- Esto permite que Supabase/PostgREST realice JOINs hacia la tabla perfiles
-- para obtener la información del autor que escribe el comentario.

-- Asegurándonos de que no existan las constraints previamente
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_target_id_fkey,
DROP CONSTRAINT IF EXISTS reviews_author_id_fkey;

-- Añadiendo Constraints formales hacia perfiles
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.perfiles(id) ON DELETE CASCADE,
ADD CONSTRAINT reviews_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.perfiles(id) ON DELETE CASCADE;

-- Confirmación de ejecución exitosa
SELECT 'Foreign Keys added successfully to public.reviews' AS status;
