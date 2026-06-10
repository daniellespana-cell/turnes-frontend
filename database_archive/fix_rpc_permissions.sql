-- =========================================================================
-- PARCHE DE SEGURIDAD: PERMISOS DE EJECUCIÓN PARA FUNCIONES RPC
-- Resuelve el error: "permission denied for function rpc_process_protocol_step1"
-- =========================================================================

-- Aseguramos que el rol de supabase autenticado pueda ejecutar las funciones del protocolo
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1 TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1 TO anon;

-- Aseguramos también el uso para el esquema completo por si acaso (opcional pero seguro)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Ojalá ya hayas corrido el fix_chat_backfill.sql !
