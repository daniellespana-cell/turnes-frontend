-- ==========================================
-- 🛡️ SECURITY HARDENING V3 (Permissions Fix)
-- ==========================================
-- 1. Helper Functions (Break RLS recursion)
-- 2. Grants (Allow execution by app roles)
-- 3. RLS de Postulaciones
-- 4. RLS de Vacantes (Privacy Shield)
-- ==========================================

BEGIN;

-- ── 1. HELPERS (SECURITY DEFINER) ──
CREATE OR REPLACE FUNCTION public.check_is_employer_of_vacancy(v_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.vacantes
        WHERE id = v_id AND empresa_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_confirmed_worker(v_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.postulaciones
        WHERE vacante_id = v_id 
        AND user_id = auth.uid()
        AND status IN ('confirmado', 'confirmed', 'en_progreso', 'finalizado')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 2. GRANTS ──
-- 🛡️ Crucial: Permitir que los roles de la App ejecuten estas funciones
GRANT EXECUTE ON FUNCTION public.check_is_employer_of_vacancy(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_is_confirmed_worker(uuid) TO authenticated, anon;


-- ── 3. RLS PARA POSTULACIONES ──
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias postulaciones" ON public.postulaciones;
CREATE POLICY "Usuarios pueden ver sus propias postulaciones" ON public.postulaciones
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden postularse a sí mismos" ON public.postulaciones;
CREATE POLICY "Usuarios pueden postularse a sí mismos" ON public.postulaciones
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Empresas pueden ver postulantes de sus vacantes" ON public.postulaciones;
CREATE POLICY "Empresas pueden ver postulantes de sus vacantes" ON public.postulaciones
FOR SELECT USING (public.check_is_employer_of_vacancy(vacante_id));

DROP POLICY IF EXISTS "Empresas pueden gestionar postulaciones de sus vacantes" ON public.postulaciones;
CREATE POLICY "Empresas pueden gestionar postulaciones de sus vacantes" ON public.postulaciones
FOR UPDATE USING (public.check_is_employer_of_vacancy(vacante_id));


-- ── 4. RLS PARA VACANTES ──
ALTER TABLE public.vacantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Empresas gestionan sus propias vacantes" ON public.vacantes;
CREATE POLICY "Empresas gestionan sus propias vacantes" ON public.vacantes
FOR ALL USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "Trabajadores confirmados ven datos reales" ON public.vacantes;
CREATE POLICY "Trabajadores confirmados ven datos reales" ON public.vacantes
FOR SELECT USING (public.check_is_confirmed_worker(id));

DROP POLICY IF EXISTS "Lectura pública de vacantes activas" ON public.vacantes;
CREATE POLICY "Lectura pública de vacantes activas" ON public.vacantes
FOR SELECT USING (status = 'activa');


-- ── 5. VISTA PROTEGIDA ──
DROP VIEW IF EXISTS public.vacantes_public CASCADE;
CREATE OR REPLACE VIEW public.vacantes_public AS
SELECT 
    id, empresa_id, titulo, descripcion, pago_monto, 
    tipo_turno, modalidad, categoria, etiquetas, status, 
    es_urgente, created_at,
    (lat::double precision + (random() - 0.5) * 0.09) AS lat,
    (lng::double precision + (random() - 0.5) * 0.09) AS lng,
    NULL::text AS direccion_formateada
FROM public.vacantes
WHERE status = 'activa';

GRANT SELECT ON public.vacantes_public TO authenticated, anon;

COMMIT;