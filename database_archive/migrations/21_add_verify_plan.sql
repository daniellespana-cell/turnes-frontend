-- 🛠️ 21_add_verify_plan.sql
-- OBJETIVO: Crear los planes 'verify' y 'boost' con nombres de columna corregidos.

BEGIN;

-- 1. ASEGURAR ESTRUCTURA (Resiliencia)
ALTER TABLE public.planes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.planes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.planes ADD COLUMN IF NOT EXISTS features TEXT[];

-- Asegurar que 'slug' sea único para el UPSERT
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'planes' AND indexname = 'planes_slug_key') THEN
        ALTER TABLE public.planes ADD CONSTRAINT planes_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. PLAN DE VERIFICACIÓN
INSERT INTO public.planes (id, nombre, description, slug, costo_mensual, features)
VALUES (
    gen_random_uuid(),
    'Verificación Elite',
    'Sello de confianza para perfiles que buscan máxima visibilidad y seguridad.',
    'verify',
    20000,
    ARRAY['Sello de verificación', 'Prioridad en búsquedas', 'Soporte premium']
)
ON CONFLICT (slug) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    description = EXCLUDED.description,
    costo_mensual = EXCLUDED.costo_mensual,
    features = EXCLUDED.features;

-- 3. PLAN DE IMPULSO (BOOST)
INSERT INTO public.planes (id, nombre, description, slug, costo_mensual, features)
VALUES (
    gen_random_uuid(),
    'Impulso Urgente',
    'Posiciona tu vacante en el top para contratar 2.4x más rápido.',
    'boost',
    7000,
    ARRAY['Posicionamiento Top', 'Notificaciones push', 'Destaque visual']
)
ON CONFLICT (slug) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    description = EXCLUDED.description,
    costo_mensual = EXCLUDED.costo_mensual,
    features = EXCLUDED.features;

COMMIT;

-- Aviso
DO $$
BEGIN
    RAISE NOTICE '✅ Planes "verify" y "boost" creados exitosamente con estructura corregida.';
END $$;
