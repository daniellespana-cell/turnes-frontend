-- =========================================================================
-- PARCHE CRÍTICO: PERMISOS PARA LA FUNCIÓN RLS DE CHAT
-- Resuelve el error: "permission denied for function can_access_chat"
-- =========================================================================

-- La función `can_access_chat` fue creada como SECURITY DEFINER para optimizar
-- el RLS de la tabla `mensajes`, pero Postgres requiere que otorguemos explícitamente
-- permisos de ejecución a los roles que interactúan desde la App (authenticated).

GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO anon;
