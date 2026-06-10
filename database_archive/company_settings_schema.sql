-- ==============================================================================
-- 1. CREACIÓN DE LA TABLA `company_settings`
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'support_email', 'contact_phone'
    value_text TEXT NOT NULL,             -- Ej: 'soporte@turnes.co'
    description TEXT,                     -- Qué hace este valor
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Pública (Cualquiera puede leer la información de contacto)
CREATE POLICY "Permitir lectura publica de configuracion de empresa"
ON public.company_settings FOR SELECT
USING (true);

-- Política de escritura: Solo Administradores (Requiere rol de admin o service_role)
-- *Nota: Asumimos que los cambios se harán vía Dashboard Admin o directamente en DB por ahora*
CREATE POLICY "Solo admins pueden modificar configuracion de empresa"
ON public.company_settings FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ==============================================================================
-- Asignar permisos básicos a roles de API de Supabase
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.company_settings TO anon, authenticated;

-- ==============================================================================
-- 2. POBLAR DATOS INICIALES (Moviendo los quemados de ContactInfo.jsx)
-- ==============================================================================
INSERT INTO public.company_settings (key_name, value_text, description)
VALUES 
    ('contact_phone', '+57 (601) 555-5555', 'Llamada directa para soporte urgente.'),
    ('support_email', 'soporte@turnes.co', 'Respuesta en menos de 24 horas hábiles.'),
    ('office_hours', 'Lun - Vie: 8:00 AM - 6:00 PM (COT)', 'Horario continuado de soporte técnico.'),
    ('hq_location', 'Bogotá D.C., Colombia', 'Sede administrativa (solo por cita).')
ON CONFLICT (key_name) DO UPDATE 
SET value_text = EXCLUDED.value_text,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

-- Trigger para automatizar el updated_at (Si existe la función handle_updated_at de otras tablas)
-- CREATE TRIGGER on_company_settings_update
-- BEFORE UPDATE ON public.company_settings
-- FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
