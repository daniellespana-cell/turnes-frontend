-- Fix missing privileges on calificaciones causing 403 Forbidden errors on boot

-- 1. Grant base table privileges to authenticated and anon users
GRANT SELECT, INSERT, UPDATE ON public.calificaciones TO authenticated;
GRANT SELECT ON public.calificaciones TO anon;

-- 2. Drop and recreate the read policy cleanly
DROP POLICY IF EXISTS "calificaciones_read_all" ON public.calificaciones;

CREATE POLICY "calificaciones_read_all" 
ON public.calificaciones 
FOR SELECT 
USING (true);

-- 3. Ensure RLS is enabled
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
