-- =========================================================================
-- fix_chat_realtime_master.sql
-- OBJETIVO: Garantizar que los mensajes lleguen al postulante en tiempo real.
-- 
-- Este script soluciona:
-- 1. Falta de la tabla 'mensajes' en la publicación de Realtime.
-- 2. RLS bloqueando el SELECT para el postulante.
-- 3. Replica Identity incorrecta.
-- =========================================================================

BEGIN;

-- 1. ⚡ ACTIVAR REALTIME PARA MENSAJES
-- Supabase requiere que la tabla esté en la publicación 'supabase_realtime'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'mensajes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
    END IF;
END $$;

-- Asegurar que enviamos todos los datos en el broadcast
ALTER TABLE public.mensajes REPLICA IDENTITY FULL;


-- 2. 🛡️ REPARAR FUNCIÓN DE ACCESO (can_access_chat)
-- La hacemos SECURITY DEFINER y ultra-explícita para evitar ambigüedades.
CREATE OR REPLACE FUNCTION public.can_access_chat(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_allowed BOOLEAN;
BEGIN
    -- Buscamos si existe una postulación que vincule al usuario con el chat
    -- p.id es el chat_id (ID de la postulación)
    SELECT EXISTS (
        SELECT 1 
        FROM public.postulaciones p
        LEFT JOIN public.vacantes v ON p.vacante_id = v.id
        WHERE p.id = p_chat_id 
        AND (p.user_id = p_user_id OR v.empresa_id = p_user_id)
    ) INTO v_allowed;

    RETURN COALESCE(v_allowed, FALSE);
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.can_access_chat(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat(UUID, UUID) TO anon;


-- 3. 🔐 LIMPIEZA Y RECONSTRUCCIÓN DE RLS PARA MENSAJES
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participantes pueden leer" ON public.mensajes;
DROP POLICY IF EXISTS "Participantes pueden enviar" ON public.mensajes;
DROP POLICY IF EXISTS "Marcar Leido Mensajes" ON public.mensajes;
DROP POLICY IF EXISTS "Eliminar mensajes propios" ON public.mensajes;

-- LECTURA: Permite al postulante o empresa ver los mensajes si están vinculados a la postulación
CREATE POLICY "Participantes pueden leer" ON public.mensajes
FOR SELECT TO authenticated
USING ( public.can_access_chat(conversacion_id, auth.uid()) );

-- INSERCIÓN: Permite enviar mensajes si eres parte del chat
CREATE POLICY "Participantes pueden enviar" ON public.mensajes
FOR INSERT TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    public.can_access_chat(conversacion_id, auth.uid())
);

-- ACTUALIZACIÓN: Para el check de lectura (leido = true)
CREATE POLICY "Marcar Leido Mensajes" ON public.mensajes
FOR UPDATE TO authenticated
USING ( public.can_access_chat(conversacion_id, auth.uid()) )
WITH CHECK ( public.can_access_chat(conversacion_id, auth.uid()) );


-- 4. 🛡️ ASEGURAR RLS DE POSTULACIONES
-- Si can_access_chat es SECURITY DEFINER no debería importar, pero es mejor que el 
-- postulante pueda ver su propia postulación siempre.
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicant Own" ON public.postulaciones;
DROP POLICY IF EXISTS "Postulante ve sus propias" ON public.postulaciones;

CREATE POLICY "Postulante ve sus propias" ON public.postulaciones
FOR SELECT TO authenticated
USING ( user_id = auth.uid() );


COMMIT;

-- =========================================================================
-- NOTA: Después de correr esto, el postulante debería ver los mensajes
-- incluso si la postulación está en estado 'pendiente' (Invitación inicial).
-- =========================================================================
