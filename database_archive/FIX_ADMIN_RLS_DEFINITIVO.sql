-- ==============================================================================
-- ✅ TURNES: FIX DEFINITIVO RLS ADMIN — EJECUTAR COMO ÚNICO SCRIPT
-- Soluciona: "permission denied for table verification_requests"
-- Causa raíz: política JWT-based sin token actualizado pisaba la política DB-based
-- ==============================================================================

BEGIN;

-- 1. LIMPIAR TODAS las políticas conflictivas de verification_requests
DROP POLICY IF EXISTS "Admin full access"            ON public.verification_requests;
DROP POLICY IF EXISTS "Admin full access jwt"        ON public.verification_requests;
DROP POLICY IF EXISTS "User reads own requests"      ON public.verification_requests;
DROP POLICY IF EXISTS "User inserts own request"     ON public.verification_requests;
DROP POLICY IF EXISTS "User updates own request"     ON public.verification_requests;

-- 2. HABILITAR RLS (por si acaso quedó deshabilitado)
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 3. RECREAR políticas limpias usando DB (no JWT - ese es el bug)

-- El usuario solo ve sus propias solicitudes
CREATE POLICY "vr_user_select"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

-- El usuario puede crear su propia solicitud
CREATE POLICY "vr_user_insert"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- El admin ve TODO (basado en la tabla perfiles, NO en el JWT)
CREATE POLICY "vr_admin_all"
    ON public.verification_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 4. LIMPIAR políticas de Storage conflictivas
DROP POLICY IF EXISTS "Admin reads all docs"  ON storage.objects;
DROP POLICY IF EXISTS "Admin reads all docs v2" ON storage.objects;

-- Política storage correcta (también DB-based)
CREATE POLICY "storage_admin_read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-docs'
        AND EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 5. FORZAR RECARGA del caché de PostgREST inmediatamente
NOTIFY pgrst, 'reload schema';

COMMIT;

DO $$ BEGIN
  RAISE NOTICE '✅ RLS Admin reconstruido correctamente. PostgREST recargado.';
END $$;
