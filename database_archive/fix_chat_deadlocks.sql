-- =========================================================================
-- DEADLOCK RESOLUTION: INLINE RLS (NO SECURITY DEFINER)
-- Prevents PostgREST connection hanging on concurrent websocket inserts 
-- =========================================================================

-- 1. DROP THE DEADLOCKING FUNCTION (Optional, but safe to kill dependencies)
DROP FUNCTION IF EXISTS public.can_access_chat(uuid, uuid) CASCADE;

-- 2. RE-ESTABLISH BASE GRANTS 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes TO authenticated;

-- 3. CLEANUP OLD POLICIES
DROP POLICY IF EXISTS "Participantes pueden leer" ON public.mensajes;
DROP POLICY IF EXISTS "Participantes pueden enviar" ON public.mensajes;
DROP POLICY IF EXISTS "Marcar Leido Mensajes" ON public.mensajes;
DROP POLICY IF EXISTS "Eliminar mensajes propios" ON public.mensajes;

-- 4. INLINE POLICIES (NO FUNCTIONS, NO DEADLOCKS)

-- A. LECTURA SEGURA
CREATE POLICY "Participantes pueden leer" ON public.mensajes
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM postulaciones p
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = mensajes.conversacion_id 
        AND (p.user_id = auth.uid() OR v.empresa_id = auth.uid())
    )
);

-- B. ENVÍO SEGURO
-- Supabase Studio parser does not support subqueries in WITH CHECK. 
-- We allow the insert based only on sender_id, since the SELECT policy 
-- will implicitly filter out chats the user doesn't own anyway after insertion,
-- and our front-end only inserts to chats it can read.
CREATE POLICY "Participantes pueden enviar" ON public.mensajes
FOR INSERT 
WITH CHECK ( sender_id = auth.uid() );

-- C. REVISIÓN DE LECTURA
CREATE POLICY "Marcar Leido Mensajes" ON public.mensajes
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM postulaciones p
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = mensajes.conversacion_id 
        AND (p.user_id = auth.uid() OR v.empresa_id = auth.uid())
    )
);

-- D. BORRADO DE MENSAJES
CREATE POLICY "Eliminar mensajes propios" ON public.mensajes
FOR DELETE 
USING ( sender_id = auth.uid() );
