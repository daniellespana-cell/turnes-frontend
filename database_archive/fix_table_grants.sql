-- =========================================================================
-- PARCHE CRÍTICO: PERMISOS BASE DE POSTGRES (TABLE GRANTS)
-- Resuelve el error: "permission denied for table turnes_chats"
-- =========================================================================

-- Cuando creas tablas por código SQL (en vez de por la interfaz gráfica de Supabase), 
-- PostgreSQL requiere que le demos permiso explícito a la API web ('authenticated') 
-- para poder siquiera "tocar" la tabla, independientemente de las reglas RLS.

-- 1. Permisos para la tabla base de Chats
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.turnes_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.turnes_chats TO anon;

-- 2. Permisos para la tabla de Mensajes (por si acaso también se corrompieron antes)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes TO anon;

-- Con esto, 'authenticated' ya puede tocar la tabla, y entonces las políticas RLS 
-- que creamos antes ("Participantes pueden ver sus chats") ahora sí harán su trabajo.
