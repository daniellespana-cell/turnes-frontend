-- ==============================================================================
-- 🔑 FIX FINAL: GRANT + RLS para verification_requests
-- Ejecutar en Supabase SQL Editor
-- ==============================================================================

-- PASO 1: GRANTS - Sin esto, PostgreSQL rechaza ANTES de evaluar las políticas RLS
GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO anon;

-- PASO 2: Asegurarnos que RLS esté habilitado
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- PASO 3: Destruir TODAS las políticas existentes en esta tabla (limpieza total)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'verification_requests' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.verification_requests', pol.policyname);
    END LOOP;
END;
$$;

-- PASO 4: Crear políticas nuevas y limpias
-- Usuario ve sus propias solicitudes
CREATE POLICY "vr_select_own"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Usuario crea su propia solicitud  
CREATE POLICY "vr_insert_own"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin tiene acceso total (usando perfiles, NO jwt)
CREATE POLICY "vr_admin_all"
    ON public.verification_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol::text = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol::text = 'admin'
        )
    );

-- PASO 5: Verificar que tu usuario tiene rol admin en perfiles
-- (Solo informativo, no hace cambios)
SELECT id, rol, nombre_display 
FROM public.perfiles 
WHERE rol::text = 'admin';

-- PASO 6: Recargar caché PostgREST
NOTIFY pgrst, 'reload schema';
