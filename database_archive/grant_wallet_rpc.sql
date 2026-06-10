-- 🔐 Security Fix: Allow authenticated users to execute the wallet payment RPC
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet TO service_role;

-- If the above fails due to specific function arguments being required by your PG version, use:
-- GRANT EXECUTE ON FUNCTION public.rpc_procesar_pago_wallet(numeric, uuid, text) TO authenticated;
