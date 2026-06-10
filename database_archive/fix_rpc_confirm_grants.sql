-- 🛠️ HOTFIX: Permisos de Ejecución para Funciones del Protocolo (Paso 3)
-- Resuelve el error 42501 "permission denied for function rpc_confirm_agreement"

-- 1. Permisos para Solicitar Validaciones de Video
GRANT EXECUTE ON FUNCTION public.rpc_request_video_validation TO authenticated;

-- 2. Permisos para Obtener Estadísticas de Video
GRANT EXECUTE ON FUNCTION public.rpc_get_video_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_video_stats TO anon; -- Opcional, si se muestra en UI pública

-- 3. Permisos para Confirmar Acuerdo (El crucial)
GRANT EXECUTE ON FUNCTION public.rpc_confirm_agreement TO authenticated;

-- Aseguramos nuevamente el usage general por prevención
GRANT USAGE ON SCHEMA public TO authenticated;

SELECT 'Grants aplicados exitosamente a las funciones del Business Protocol.' AS Fix_Result;
