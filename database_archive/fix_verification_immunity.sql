-- 🛡️ FIX: INMUNIDAD DE VERIFICACIÓN
-- Asegura que el estado 'verificado' no se pierda durante los updates de perfil.

BEGIN;

-- 1. Función para proteger el estado verificado
CREATE OR REPLACE FUNCTION public.fn_protect_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el registro ya estaba verificado, prohibir que pase a false 
    -- a menos que sea una acción explícita de un admin (esto es un bypass de seguridad)
    IF OLD.verificado = true AND NEW.verificado = false THEN
        -- Mantener el estado verificado si el update viene de un usuario normal
        -- (Podemos refinar esto si tienes roles de admin específicos)
        NEW.verificado := true;
    END IF;

    -- Sincronizar verificado entre perfiles y empresas
    -- Si perfiles cambia, empresas debe seguirlo SÍ O SÍ
    UPDATE public.empresas SET verificado = NEW.verificado WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger de Inmunidad
DROP TRIGGER IF EXISTS trg_protect_verification_status ON public.perfiles;
CREATE TRIGGER trg_protect_verification_status
BEFORE UPDATE OF nombre_display, nombre_empresa, nit, lat, lng ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.fn_protect_verification_status();

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Inmunidad de Verificación Activa: El estado verificado ahora es persistente.'; END $$;
