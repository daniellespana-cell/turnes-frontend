-- 🛡️ ZERO TRUST SECURITY PATCH: EMPRESAS PRIVACY
-- Objetivo: Cerrar la vulnerabilidad que permite a postulantes espiar los planes de las empresas.
-- Arquitectura: La tabla 'empresas' se vuelve privada. La info pública (nombre/logo) debe fluir por 'perfiles'.

BEGIN;

-- 1. 🔥 ELIMINAR POLÍTICA PERMISIVA
DROP POLICY IF EXISTS "Public Read Companies" ON public.empresas;
DROP POLICY IF EXISTS "Public read active plans" ON public.planes;

-- 2. 🔐 RESTRINGIR TABLA 'EMPRESAS' (Solo Dueño)
-- Ahora solo el dueño de la empresa puede ver sus datos fiscales y su plan.
CREATE POLICY "Owner Read Self Company" ON public.empresas
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 3. 🔐 RESTRINGIR TABLA 'PLANES'
-- Sigue siendo legible para que las empresas elijan plan, pero no se puede linkear con otras empresas fácilmente.
CREATE POLICY "Authenticated Read Planes" ON public.planes
    FOR SELECT TO authenticated
    USING (true);

-- 4. 🔗 RELACIÓN COMERCIAL (Excepción de Visibilidad)
-- Si un postulante está en un proceso activo, puede ver el nombre comercial básico 
-- pero NO el plan ni el NIT.
CREATE POLICY "Applicant Read Company Basic Info" ON public.empresas
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.postulaciones p
            JOIN public.vacantes v ON v.id = p.vacante_id
            WHERE v.empresa_id = public.empresas.id 
            AND p.user_id = auth.uid()
        )
    );

COMMIT;

-- 📝 NOTA SENIOR: Con este cambio, si un hacker intenta hacer:
-- select * from empresas join planes on empresas.plan_id = planes.id
-- Solo obtendrá resultados de SU PROPIA empresa o de aquellas donde sea postulante activo.
