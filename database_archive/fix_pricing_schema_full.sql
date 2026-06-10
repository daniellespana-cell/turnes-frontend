-- 🛠️ SCRIPT DE REPARACIÓN COMPLETA: PLANES Y MICROSERVICIOS (CORREGIDO)
-- Este script corrige el error de sintaxis y asegura la creación de tablas.

DO $$
BEGIN

    -- ==========================================
    -- 1. TABLA PLANES (Asegurar estructura)
    -- ==========================================
    RAISE NOTICE '🔧 Verificando tabla planes...';

    -- Crear columnas si faltan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'slug') THEN
        ALTER TABLE public.planes ADD COLUMN slug TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'description') THEN
        ALTER TABLE public.planes ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'features') THEN
        ALTER TABLE public.planes ADD COLUMN features TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'benefits') THEN
        ALTER TABLE public.planes ADD COLUMN benefits JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'is_popular') THEN
        ALTER TABLE public.planes ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;

    -- ==========================================
    -- 2. TABLA MICROSERVICIOS (Crear si falta)
    -- ==========================================
    RAISE NOTICE '🔧 Verificando tabla microservices...';

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'microservices') THEN
        CREATE TABLE public.microservices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            title TEXT NOT NULL,
            price DECIMAL(12,2) NOT NULL,
            target_audience TEXT CHECK (target_audience IN ('EMPRESAS', 'TRABAJADORES')),
            description TEXT,
            icon_key TEXT,
            is_active BOOLEAN DEFAULT true
        );
        RAISE NOTICE '✅ Tabla microservices creada.';
    END IF;

    -- ==========================================
    -- 3. PERMISOS Y POLÍTICAS (RLS)
    -- ==========================================
    RAISE NOTICE '🔐 Aplicando políticas de seguridad...';

    -- Planes
    EXECUTE 'ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY';
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'planes' AND policyname = 'Public read active plans') THEN
        CREATE POLICY "Public read active plans" ON public.planes FOR SELECT TO authenticated, anon USING (true);
    END IF;

    -- Microservices
    EXECUTE 'ALTER TABLE public.microservices ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'microservices' AND policyname = 'Public read active services') THEN
        CREATE POLICY "Public read active services" ON public.microservices FOR SELECT TO authenticated, anon USING (is_active = true);
    END IF;

    RAISE NOTICE '✅ Esquema verificado correctamente.';

END $$;

-- ==========================================
-- 4. INSERTAR DATOS (Fuera del bloque DO para usar UPSERT simple)
-- ==========================================

-- Datos de Planes (UPSERT)
INSERT INTO public.planes (id, nombre, costo_mensual, comision_turnos_pct, slug, description, features, benefits, is_popular)
VALUES 
(gen_random_uuid(), 'Plan Básico', 0, 6.00, 'basic', 'Perfecto para probar la plataforma sin riesgos.', ARRAY['Publicaciones ilimitadas', 'Chat interno', 'Soporte estándar'], '{"commission_rate": 0.06}'::jsonb, false),
(gen_random_uuid(), 'Plan Micro', 29900, 4.00, 'micro', 'Para negocios locales activos.', ARRAY['3 destacadas/mes', '7 fijas sin costo', 'Soporte prioritario'], '{"commission_rate": 0.04}'::jsonb, true),
(gen_random_uuid(), 'Plan Pro', 79900, 0.00, 'pro', 'Máxima rentabilidad.', ARRAY['Comisión 0% SIEMPRE', '30 fijas/mes', 'Top Worker'], '{"commission_rate": 0.00}'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    costo_mensual = EXCLUDED.costo_mensual,
    comision_turnos_pct = EXCLUDED.comision_turnos_pct,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    benefits = EXCLUDED.benefits,
    is_popular = EXCLUDED.is_popular;

-- Datos de Microservicios (Insertar si no existen)
INSERT INTO public.microservices (title, price, target_audience, description, icon_key)
SELECT 'Publicación Urgente', 7000, 'EMPRESAS', 'Destaca tu vacante como Urgente por 24 horas.', 'megaphone'
WHERE NOT EXISTS (SELECT 1 FROM public.microservices WHERE title = 'Publicación Urgente');

INSERT INTO public.microservices (title, price, target_audience, description, icon_key)
SELECT 'Verificación Premium', 20000, 'EMPRESAS', 'Badge de confianza y verificación de identidad.', 'shield-check'
WHERE NOT EXISTS (SELECT 1 FROM public.microservices WHERE title = 'Verificación Premium');

INSERT INTO public.microservices (title, price, target_audience, description, icon_key)
SELECT 'Perfil Destacado', 9900, 'TRABAJADORES', 'Aparece primero en las búsquedas.', 'star'
WHERE NOT EXISTS (SELECT 1 FROM public.microservices WHERE title = 'Perfil Destacado');

INSERT INTO public.microservices (title, price, target_audience, description, icon_key)
SELECT 'Pago Inmediato', 3500, 'TRABAJADORES', 'Recibe tu pago al finalizar el turno.', 'zap'
WHERE NOT EXISTS (SELECT 1 FROM public.microservices WHERE title = 'Pago Inmediato');

INSERT INTO public.microservices (title, price, target_audience, description, icon_key)
SELECT 'Seguro por Turno', 0, 'TRABAJADORES', 'Seguro de accidentes personales.', 'umbrella'
WHERE NOT EXISTS (SELECT 1 FROM public.microservices WHERE title = 'Seguro por Turno');
