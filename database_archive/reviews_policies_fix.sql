-- 🛠️ CORRECCIÓN DE PERMISOS: REVIEWS (RLS FIX)
-- Ejecutar en el Editor SQL de Supabase para solucionar el error 403 Forbidden

-- 1. Asegurar que RLS esté habilitado (Buenas prácticas)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas antiguas (para evitar conflictos o duplicados)
DROP POLICY IF EXISTS "Reviews visibles para todos" ON public.reviews;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reviews" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on author_id" ON public.reviews;

-- 3. Crear Política de LECTURA (Pública)
-- Todo el mundo puede ver las calificaciones (necesario para perfiles públicos)
CREATE POLICY "Enable read access for all users" ON public.reviews
FOR SELECT USING (true);

-- 4. Crear Política de ESCRITURA (Autenticada)
-- Solo usuarios logueados pueden dejar reviews.
-- Además, validamos que el author_id coincida con el usuario actual (Integridad básica)
CREATE POLICY "Enable insert for authenticated users only" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 5. (Opcional) Política de MODIFICACIÓN
-- Solo el autor puede editar su propia review
CREATE POLICY "Enable update for users based on author_id" ON public.reviews
FOR UPDATE USING (auth.uid() = author_id);

-- 6. CRÍTICO: Otorgar permisos de nivel de tabla (GRANTS)
-- A veces RLS está bien, pero el rol 'anon' no tiene permiso básico de SELECT.
GRANT SELECT ON public.reviews TO anon, authenticated, service_role;
GRANT INSERT ON public.reviews TO authenticated, service_role;
GRANT UPDATE ON public.reviews TO authenticated, service_role;
