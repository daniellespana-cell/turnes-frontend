-- 28_notification_delete_rls.sql
-- Concede permisos de Borrado al usuario para sus propias notificaciones

-- 1. Dar permiso explícito a authenticated para ejecutar DELETE en esta tabla
GRANT DELETE ON public.notificaciones TO authenticated;

-- 2. Crear la política RLS para DELETE
DROP POLICY IF EXISTS "User deletes own notifications" ON public.notificaciones;

CREATE POLICY "User deletes own notifications"
    ON public.notificaciones FOR DELETE
    USING (auth.uid() = user_id);
