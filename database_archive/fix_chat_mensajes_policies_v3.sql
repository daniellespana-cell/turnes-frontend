-- =========================================================================
-- PARCHE CRÍTICO: RLS DE MENSAJES V3 (BYPASS DE INCONSISTENCIA DE DATOS)
-- =========================================================================

-- Hemos determinado que la política de INSERT de 'mensajes' está arrojando un 403 Forbidden
-- para la Empresa pero NO para el candidato. Esto significa que la caché de la tabla 'turnes_chats'
-- tiene un ID de empresa desfasado con el auth.uid() de la sesión actual de la app.

-- Para reparar el flujo instantáneamente como en WhatsApp, vamos a reconstruir las políticas 
-- de la tabla 'mensajes' para que dependan del function 'can_access_chat' (cruzando las tablas reales)
-- en lugar de la tabla de atajos, garantizando el 100% de precisión de autenticación.

DROP POLICY IF EXISTS "Participantes pueden leer" ON public.mensajes;
DROP POLICY IF EXISTS "Participantes pueden enviar" ON public.mensajes;
DROP POLICY IF EXISTS "Marcar Leido Mensajes" ON public.mensajes;
DROP POLICY IF EXISTS "Eliminar mensajes propios" ON public.mensajes;

-- 1. READ
CREATE POLICY "Participantes pueden leer" ON public.mensajes
FOR SELECT USING ( can_access_chat(conversacion_id, auth.uid()) );

-- 2. INSERT
CREATE POLICY "Participantes pueden enviar" ON public.mensajes
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    can_access_chat(conversacion_id, auth.uid())
);

-- 3. UPDATE (Leer / Marcar lectura)
CREATE POLICY "Marcar Leido Mensajes" ON public.mensajes
FOR UPDATE USING ( can_access_chat(conversacion_id, auth.uid()) );

-- 4. DELETE (Solo dueños de sus mensajes)
CREATE POLICY "Eliminar mensajes propios" ON public.mensajes
FOR DELETE USING ( sender_id = auth.uid() );

-- Asegurar nuevamente que los permisos base a la tabla están expuestos
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO authenticated;
