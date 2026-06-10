-- =========================================================================
-- MASTER FIX: RLS & COLUMN AMBIGUITY (ATOMIC SCRIPT)
-- Solución final al Error 400 (Ambiguous) y 403 (Permisos RLS)
-- Resuelve el error 2BP01: cannot drop function porque depende de policies
-- =========================================================================

-- 1. Destruimos la función problemática y forzamos (CASCADE) la destrucción
--    de cualquier regla de lectura/escritura (policy) que dependiera de ella.
DROP FUNCTION IF EXISTS public.can_access_chat(uuid, uuid) CASCADE;

-- 2. Creamos la función reparada con el parámetro `p_user_id` para
--    eliminar la ambigüedad con la columna `postulaciones.user_id` de por vida.
CREATE OR REPLACE FUNCTION public.can_access_chat(chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_allowed BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM postulaciones p
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = chat_id 
        AND (p.user_id = p_user_id OR v.empresa_id = p_user_id)
    ) INTO is_allowed;
    
    RETURN is_allowed;
END;
$$;

-- 3. Volvemos a otorgar permisos de ejecución básicos
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO anon;

-- 4. Reconstruimos y re-adjuntamos todas las reglas RLS de la tabla mensajes
--    para que usen la función nueva y permitan por fin que la Empresa interactúe.

-- Asegurar nuevamente que los permisos base a la tabla están expuestos
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes TO authenticated;

-- Limpiamos reglas preexistentes que no fueron eliminadas por el CASCADE
DROP POLICY IF EXISTS "Participantes pueden leer" ON public.mensajes;
DROP POLICY IF EXISTS "Participantes pueden enviar" ON public.mensajes;
DROP POLICY IF EXISTS "Marcar Leido Mensajes" ON public.mensajes;
DROP POLICY IF EXISTS "Eliminar mensajes propios" ON public.mensajes;

-- LECTURA SEGURA
CREATE POLICY "Participantes pueden leer" ON public.mensajes
FOR SELECT USING ( can_access_chat(conversacion_id, auth.uid()) );

-- ENVÍO SEGURO (Aquí es donde la Empresa estaba bloqueada por un 403)
CREATE POLICY "Participantes pueden enviar" ON public.mensajes
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    can_access_chat(conversacion_id, auth.uid())
);

-- REVISIÓN DE LECTURA (Notificaciones/Checks azules)
CREATE POLICY "Marcar Leido Mensajes" ON public.mensajes
FOR UPDATE USING ( can_access_chat(conversacion_id, auth.uid()) );

-- BORRADO DE MENSAJES (Básico)
CREATE POLICY "Eliminar mensajes propios" ON public.mensajes
FOR DELETE USING ( sender_id = auth.uid() );
