-- 🕸️ TURNES INFRASTRUCTURE ARMOR
-- Objetivo: Activar los eventos Realtime y asegurar la configuración de Wompi.

-- 1. 📢 ACTIVAR REALTIME (Para que los listeners de React funcionen)
DO $$ 
BEGIN
    -- Asegurar que las tablas estén en la publicación de Realtime
    -- Intentamos agregar solo si no están ya registradas
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'billeteras') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.billeteras;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'movimientos') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.movimientos;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'perfiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.perfiles;
    END IF;
END $$;

-- 2. 🛡️ CONFIGURACIÓN DE INTEGRIDAD (SSOT para el Webhook)
-- Adaptado al esquema existente (key_name, value_text)
CREATE TABLE IF NOT EXISTS public.company_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name text UNIQUE NOT NULL,
    value_text text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Insertar el secreto de Wompi (Basado en lo que ya tenemos en .env)
INSERT INTO public.company_settings (key_name, value_text)
VALUES ('wompi_integrity_secret', 'test_integrity_ophHNrXukufhM1mExOh5oTLuKBGuRK0t')
ON CONFLICT (key_name) DO UPDATE SET value_text = EXCLUDED.value_text;

-- 3. 🔍 VERIFICACIÓN DE PERMISOS
-- Asegurar que el rol anon/authenticated pueda ver sus propios movimientos (RLS)
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Usuarios pueden ver sus propios movimientos') THEN
        CREATE POLICY "Usuarios pueden ver sus propios movimientos" ON public.movimientos
        FOR SELECT TO authenticated
        USING (auth.uid() = billetera_id);
    END IF;
END $$;
