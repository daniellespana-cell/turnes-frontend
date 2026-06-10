-- ==========================================
-- SCRIPT DE PARCHE DE CHAT (PERFIL / REALTIME)
-- ==========================================
-- Proposito: Habilitar explícitamente el Broadcast de Supabase Realtime 
-- para la tabla `mensajes`, asegurando que ambas partes vean los chats al instante
-- y la interfaz no se vuelva dependiente de fetch manual.

DO $$
BEGIN
    -- Verifica si la tabla mensajes ya está en la publicación de realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'mensajes'
    ) THEN
        -- Si no está, la añade
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
    END IF;
END
$$;
