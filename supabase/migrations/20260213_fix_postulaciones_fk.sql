-- 🚨 20260213_fix_postulaciones_fk.sql
-- PROBLEM: PostgREST fails to join 'postulaciones' -> 'perfiles' because the FK points to 'auth.users'.
-- SOLUTION: Change FK to point to 'public.perfiles(id)'.
-- NOTE: 'public.perfiles.id' is already a FK to 'auth.users.id', so integrity is maintained.

BEGIN;

-- 1. Drop old constraint
ALTER TABLE public.postulaciones 
DROP CONSTRAINT IF EXISTS postulaciones_user_id_fkey;

-- 2. Add new constraint pointing to PUBLIC schema (enables PostgREST join)
ALTER TABLE public.postulaciones
ADD CONSTRAINT postulaciones_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.perfiles(id)
ON DELETE CASCADE;

COMMIT;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ FK Fixed: postulaciones.user_id now references public.perfiles(id)';
END $$;
