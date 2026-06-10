-- 🔄 MIGRACIÓN: PLANES Y MICROSERVICIOS (DB-DRIVEN)
-- Objetivo: Centralizar la lógica de precios y beneficios en la base de datos.

-- ==========================================
-- 1. ACTUALIZACIÓN TABLA PLANES
-- ==========================================

-- Aseguramos que existan las columnas necesarias
DO $$
BEGIN
    -- Slug único para identificar planes en código (basic, micro, pro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'slug') THEN
        ALTER TABLE public.planes ADD COLUMN slug TEXT UNIQUE;
    END IF;

    -- Descripción comercial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'description') THEN
        ALTER TABLE public.planes ADD COLUMN description TEXT;
    END IF;

    -- Lista de beneficios (Bullets)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'features') THEN
        ALTER TABLE public.planes ADD COLUMN features TEXT[];
    END IF;

    -- Beneficios estructurados (Limites, comisiones)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'benefits') THEN
        ALTER TABLE public.planes ADD COLUMN benefits JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Flag para destacar (Más popular)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'is_popular') THEN
        ALTER TABLE public.planes ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;
END $$;

-- LIMPIEZA DE DATOS ANTIGUOS (Opcional, para asegurar que insertamos los nuevos limpios)
-- DELETE FROM public.planes; -- PELIGROSO SI HAY FK. Mejor hacemos UPSERT por slug si es posible, o por nombre.

-- INSERTAR / ACTUALIZAR DATOS (Upsert based on 'slug' if update logic existed, but we'll try standard INSERT ON CONFLICT)

-- PLAN BASICO
INSERT INTO public.planes (id, nombre, costo_mensual, comision_turnos_pct, slug, description, features, benefits, is_popular)
VALUES (
    gen_random_uuid(),
    'Plan Básico',
    0,
    6.00, -- 6%
    'basic',
    'Perfecto para probar la plataforma sin riesgos.',
    ARRAY['Publicaciones ilimitadas por turnos', 'Chat interno', 'Calificaciones y reputación', 'Soporte estándar'],
    '{"fixed_posts_limit": 0, "fixed_post_price": 19900, "commission_rate": 0.06}'::jsonb,
    false
) ON CONFLICT (slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    costo_mensual = EXCLUDED.costo_mensual,
    comision_turnos_pct = EXCLUDED.comision_turnos_pct,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    benefits = EXCLUDED.benefits;

-- PLAN MICRO
INSERT INTO public.planes (id, nombre, costo_mensual, comision_turnos_pct, slug, description, features, benefits, is_popular)
VALUES (
    gen_random_uuid(),
    'Plan Micro',
    29900,
    4.00, -- 4%
    'micro',
    'Para negocios locales activos. Ahorra comisiones.',
    ARRAY['3 publicaciones destacadas al mes', '7 contrataciones fijas mensuales sin costo', 'Filtros avanzados', 'Soporte prioritario', 'Badge Empresa Conf'],
    '{"fixed_posts_limit": 7, "featured_posts_limit": 3, "commission_rate": 0.04}'::jsonb,
    true
) ON CONFLICT (slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    costo_mensual = EXCLUDED.costo_mensual,
    comision_turnos_pct = EXCLUDED.comision_turnos_pct,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    benefits = EXCLUDED.benefits,
    is_popular = EXCLUDED.is_popular;

-- PLAN PRO
INSERT INTO public.planes (id, nombre, costo_mensual, comision_turnos_pct, slug, description, features, benefits, is_popular)
VALUES (
    gen_random_uuid(),
    'Plan Pro',
    79900,
    0.00, -- 0%
    'pro',
    'Máxima rentabilidad. Todo incluido para alta rotación.',
    ARRAY['Comisión Cero (0%) SIEMPRE', '30 contrataciones fijas al mes', 'Acceso a Top Worker', 'Analíticas de contratación', 'Soporte Premium'],
    '{"fixed_posts_limit": 30, "featured_posts_limit": 999, "commission_rate": 0.00}'::jsonb,
    false
) ON CONFLICT (slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    costo_mensual = EXCLUDED.costo_mensual,
    comision_turnos_pct = EXCLUDED.comision_turnos_pct,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    benefits = EXCLUDED.benefits;


-- ==========================================
-- 2. NUEVA TABLA MICROSERVICIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.microservices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    title TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL, -- Precio fijo en COP
    target_audience TEXT CHECK (target_audience IN ('EMPRESAS', 'TRABAJADORES')),
    description TEXT,
    icon_key TEXT, -- Identificador para mapear iconos en frontend (ej: 'zap', 'shield')
    is_active BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE public.microservices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active services" ON public.microservices
    FOR SELECT TO authenticated, anon USING (is_active = true);

-- POPULATE MICROSERVICES
INSERT INTO public.microservices (title, price, target_audience, description, icon_key) VALUES
('Publicación Urgente', 7000, 'EMPRESAS', 'Destaca tu vacante como Urgente por 24 horas.', 'megaphone'),
('Verificación Premium', 20000, 'EMPRESAS', 'Badge de confianza y verificación de identidad.', 'shield-check'),
('Perfil Destacado', 9900, 'TRABAJADORES', 'Aparece primero en las búsquedas de talento (Mensual).', 'star'),
('Pago Inmediato', 3500, 'TRABAJADORES', 'Recibe tu pago al finalizar el turno (por evento).', 'zap'),
('Seguro por Turno', 0, 'TRABAJADORES', 'Seguro de accidentes personales (Precio variable).', 'umbrella'); -- Precio variable indicado como 0 base

RAISE NOTICE '✅ Esquema actualizado y datos insertados correctamente.';
