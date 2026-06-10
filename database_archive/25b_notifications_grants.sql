-- =========================================================
-- 25b_notifications_grants.sql
-- Parche: Grants faltantes en la tabla notificaciones
-- Ejecutar en Supabase SQL Editor si aparece error 42501
-- =========================================================

-- Permitir SELECT y UPDATE al rol 'authenticated' (usuarios logueados).
-- Las políticas RLS ya controlan QUÉ filas puede ver cada usuario.
-- Sin este GRANT, el motor PostgreSQL ni siquiera evalúa las políticas.
GRANT SELECT, UPDATE ON public.notificaciones TO authenticated;

-- El INSERT ya estaba cubierto vía RPC SECURITY DEFINER,
-- pero lo dejamos explícito para que Realtime también funcione.
GRANT INSERT ON public.notificaciones TO service_role;
