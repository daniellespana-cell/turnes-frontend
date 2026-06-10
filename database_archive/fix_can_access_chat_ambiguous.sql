-- =========================================================================
-- PARCHE CRÍTICO: RESOLUCIÓN DE COLUMNA AMBIGUA EN RLS DEFINER
-- Error resuelto: "column reference 'user_id' is ambiguous" (Code: 42702)
-- =========================================================================

-- Reemplazamos la función para renombrar el parámetro `user_id` a `p_user_id`
-- de forma que Postgres no lo confunda con la columna `user_id` de la tabla `postulaciones`.

DROP FUNCTION IF EXISTS public.can_access_chat(uuid, uuid);

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

-- Reiterar los permisos porsiaca
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat(uuid, uuid) TO anon;
