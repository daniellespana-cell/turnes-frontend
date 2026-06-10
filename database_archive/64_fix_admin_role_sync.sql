-- 👑 64_fix_admin_role_sync.sql
-- Soluciona el error 42883 (operator does not exist: text = rol_usuario_enum)
-- y asegura que tu sesión mantenga el rol 'admin' al refrescar (F5).

BEGIN;

-- 1. Actualizar directamente auth.users asegurando que el casteo sea explícito.
UPDATE auth.users au
SET raw_user_meta_data = COALESCE(au.raw_user_meta_data, '{}'::jsonb)
                         || jsonb_build_object('rol', p.rol::text)
FROM public.perfiles p
WHERE au.id = p.id
  AND (
    au.raw_user_meta_data->>'rol' IS DISTINCT FROM p.rol::text
    OR au.raw_user_meta_data->>'rol' IS NULL
  );

COMMIT;
