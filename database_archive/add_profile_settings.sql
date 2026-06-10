-- 🛡️ MIGRACIÓN: PERSISTENCIA DE CONFIGURACIONES EN LA NUBE
-- Añade una columna JSONB para guardar preferencias de UI, Notificaciones y Privacidad.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'configuraciones') THEN
        ALTER TABLE public.perfiles ADD COLUMN configuraciones JSONB DEFAULT '{
            "theme": "dark",
            "language": "es",
            "notifications": {
                "email": true,
                "push": true,
                "marketing": false
            },
            "privacy": {
                "profileVisibility": "public",
                "showOnlineStatus": true
            }
        }'::JSONB;
    END IF;
END $$;

-- Comentario para documentación de esquema
COMMENT ON COLUMN public.perfiles.configuraciones IS 'Preferencias de usuario persistentes (Notificaciones, UI, Privacidad)';
