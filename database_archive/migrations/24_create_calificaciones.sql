-- ⭐ 24_create_calificaciones.sql
-- OBJETIVO: Crear la arquitectura para el sistema de reseñas y estrellas (Rating).
-- Resuelve el error 404 (PGRST205) cuando el frontend intenta consultar calificaciones.

BEGIN;

-- 1. CREACIÓN DE LA TABLA
CREATE TABLE IF NOT EXISTS public.calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Quien da la reseña
    evaluated_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- A quien califican
    vacancy_id UUID REFERENCES public.vacantes(id) ON DELETE SET NULL, -- (Opcional) Contexto de la reseña
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5), -- Estrellas (1 al 5)
    comment TEXT, -- Reseña escrita
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ÍNDICES DE RENDIMIENTO (Lectura rápida)
-- El frontend hace un GET con: ?select=score&evaluated_id=eq.[USER_ID]
-- Un índice en evaluated_id acelerará inmensamente esta consulta.
CREATE INDEX IF NOT EXISTS idx_calificaciones_evaluated ON public.calificaciones(evaluated_id);

-- 3. SEGURIDAD DE FILAS (RLS)
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura Pública 
-- Cualquier visitante de la página puede ver la reputación (estrellas) de las empresas o trabajadores.
DO $$ BEGIN
    CREATE POLICY "calificaciones_read_all" 
    ON public.calificaciones FOR SELECT 
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Política 2: Inserción Segura
-- Solo usuarios con sesión iniciada pueden dejar reviews.
-- Además, obligamos a que el `evaluator_id` coincida con su token (No pueden hacerse pasar por otra persona).
DO $$ BEGIN
    CREATE POLICY "calificaciones_insert_auth" 
    ON public.calificaciones FOR INSERT 
    WITH CHECK (auth.uid() = evaluator_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. TRIGGER DE ACTUALIZACIÓN DEL PERFIL (Rating Promedio)
-- Función que recalcula el promedio cada vez que entra una calificación nueva.
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.perfiles
    SET rating = (
        SELECT ROUND(AVG(score)::numeric, 2)
        FROM public.calificaciones
        WHERE evaluated_id = NEW.evaluated_id
    )
    WHERE id = NEW.evaluated_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador que ejecuta el recálculo
DROP TRIGGER IF EXISTS trigger_update_rating ON public.calificaciones;
CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON public.calificaciones
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

COMMIT;

-- Aviso de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de Calificaciones Creado: Funcionalidad de rating lista para producción y frontend sincronizado.';
END $$;
