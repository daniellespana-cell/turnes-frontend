-- =========================================================================
-- 🔐 SYNC ROL: perfiles.rol → auth.users.raw_user_meta_data.rol
-- =========================================================================
-- PROBLEMA:
-- Cuando un usuario cambia de rol (ej: empresa → admin) directamente en la
-- tabla `perfiles`, el JWT de Supabase Auth sigue sirviendo el rol viejo
-- (el que quedó en `auth.users.raw_user_meta_data`) hasta que el usuario
-- cierre sesión y vuelva a entrar. Esto provoca que al refrescar la página,
-- el frontend reciba el rol incorrecto durante los ~50ms del "JWT Shell"
-- y tome decisiones de routing equivocadas (layout de empresa en vez de admin).
--
-- SOLUCIÓN:
-- Un trigger AFTER UPDATE que sincroniza automáticamente cualquier cambio
-- en `perfiles.rol` hacia `auth.users.raw_user_meta_data`, asegurando que
-- la próxima vez que Supabase emita un JWT, ya contenga el rol real.
-- =========================================================================

BEGIN;

-- 1. FUNCIÓN TRIGGER: Sincroniza el campo `rol` hacia auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Necesario para escribir en auth.users (schema protegido)
SET search_path = '' -- Prevención de hijack de search_path (CWE-426)
AS $$
BEGIN
    -- Solo actuar si el rol realmente cambió (evita loops y writes innecesarios)
    IF OLD.rol IS DISTINCT FROM NEW.rol THEN
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
                                 || jsonb_build_object('rol', NEW.rol::text)
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- 2. TRIGGER: Se dispara DESPUÉS de cada UPDATE en perfiles
-- Usamos WHEN para que PostgreSQL ni siquiera invoque la función si el rol no cambió
DROP TRIGGER IF EXISTS trg_sync_role_to_jwt ON public.perfiles;
CREATE TRIGGER trg_sync_role_to_jwt
    AFTER UPDATE OF rol ON public.perfiles
    FOR EACH ROW
    WHEN (OLD.rol IS DISTINCT FROM NEW.rol)
    EXECUTE FUNCTION public.sync_profile_role_to_jwt();

COMMIT;

-- =========================================================================
-- 🔧 PARCHE ÚNICO: Sincronizar los roles ACTUALES de todos los usuarios
-- Esto corrige a los usuarios que ya tienen un rol desincronizado (como tu admin).
-- Solo necesitas ejecutar esto UNA VEZ después de crear el trigger.
-- =========================================================================
UPDATE auth.users au
SET raw_user_meta_data = COALESCE(au.raw_user_meta_data, '{}'::jsonb)
                         || jsonb_build_object('rol', p.rol::text)
FROM public.perfiles p
WHERE au.id = p.id
  AND (
    au.raw_user_meta_data->>'rol' IS DISTINCT FROM p.rol::text
    OR au.raw_user_meta_data->>'rol' IS NULL
  );

-- Verificación: Ejecuta esto para confirmar que se sincronizaron
-- SELECT au.id, au.email, au.raw_user_meta_data->>'rol' as jwt_rol, p.rol as db_rol
-- FROM auth.users au
-- JOIN public.perfiles p ON au.id = p.id
-- WHERE au.raw_user_meta_data->>'rol' IS DISTINCT FROM p.rol;
