-- 🛡️ PERMISOS DE LECTURA PARA PLANES
-- Objetivo: Asegurar que el frontend pueda leer la tabla 'planes'

DO $$
BEGIN
    -- 1. Habilitar RLS en 'planes' (si no estaba ya)
    ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

    -- 2. Crear política de lectura pública (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'planes' AND policyname = 'Public read active plans'
    ) THEN
        CREATE POLICY "Public read active plans" ON public.planes
            FOR SELECT TO authenticated, anon USING (true);
        RAISE NOTICE '✅ Política de lectura pública creada para planes.';
    ELSE
        RAISE NOTICE 'ℹ️ La política de lectura pública ya existía.';
    END IF;

    -- 3. Habilitar RLS en 'microservices' (Re-confirmación)
    ALTER TABLE public.microservices ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'microservices' AND policyname = 'Public read active services'
    ) THEN
        CREATE POLICY "Public read active services" ON public.microservices
            FOR SELECT TO authenticated, anon USING (is_active = true);
    END IF;

END $$;
