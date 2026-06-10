-- ==============================================================================
-- 🔓 FIX DE PERMISOS PARA WOMPI RPC
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New Query
-- 2. Copia y pega esto.
-- 3. Dale Run.

-- Permitir que los usuarios logueados (authenticated) y el servidor (service_role)
-- ejecuten la función de firma.
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO service_role;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO anon; -- Por si acaso hay llamadas públicas

-- Asegurar que la tabla de logs sea escribible por la función (aunque sea SECURITY DEFINER)
GRANT ALL ON system_logs TO authenticated;
GRANT ALL ON system_logs TO service_role;
