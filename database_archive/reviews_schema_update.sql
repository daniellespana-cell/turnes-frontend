-- 🛠️ ACTUALIZACIÓN DE SCHEMA: REVIEWS & POSTULACIONES (Turnes V2)
-- Ejecutar en el Editor SQL de Supabase

-- 1. Crear Tabla de Reviews (Si no existe)
-- Necesaria para el componente de Reputación y "Rate your experience"
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID NOT NULL, -- Usuario calificado (User o Empresa)
    author_id UUID NOT NULL, -- Quien califica
    shift_id UUID, -- Opcional: Vinculo a la vacante/turno
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Reviews (Performance)
CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON public.reviews(author_id);

-- 2. Actualizar Tabla Postulaciones (Soporte Contract Service)
-- Necesario para el flujo de contratación y pagos (Protocolo v2.6)
ALTER TABLE public.postulaciones
ADD COLUMN IF NOT EXISTS step INT DEFAULT 0, -- 0: Applied, 1: Paid, 2: Validated...
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS protocol_state JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- 3. Corregir Status en Postulaciones
-- El error '400' sugiere que 'finalized' no es un valor válido o la columna tiene problemas.
-- Convertimos a TEXT para máxima flexibilidad y evitar bloqueos por ENUMs restrictivos.
ALTER TABLE public.postulaciones 
ALTER COLUMN status TYPE TEXT; 

-- 4. Permisos (Policies) - Básico para que funcione la API
-- Habilitar lectura pública para reviews (o ajustar según necesidad)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews visibles para todos" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = author_id);
