-- ==============================================================================
-- 🚀 rpc_get_user_boot_data
-- Autor: Turnes AI Architecture
-- Proposito: Recargar la identidad del usuario (Perfil + Billetera) en < 50ms 
--            esquivando los Deadlocks de RLS al ejecutarse con SECURITY DEFINER.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_user_boot_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- 🛡️ Bypass RLS (Crucial para evitar el loop infinito del timeout)
AS $$
DECLARE
    v_profile jsonb;
    v_empresas jsonb;
    v_wallet jsonb;
    vResult jsonb;
BEGIN
    -- 🛡️ FAIL-FAST: Si hay un bloqueo en las tablas, no colgar la conexión por 30s.
    -- Esto libera el pool de Supabase y permite al frontend reintentar o usar fallback.
    SET LOCAL statement_timeout = '25000'; -- 25 segundos máx (Tolerancia para Cold Start)
    SET LOCAL lock_timeout = '5000';       -- 5 segundos esperando un lock

    -- 1. Obtener datos de la tabla perfiles
    SELECT to_jsonb(p) INTO v_profile
    FROM public.perfiles p
    WHERE p.id = p_user_id;

    -- Si no existe el perfil, salir limpiamente (no error)
    IF v_profile IS NULL THEN
        RETURN jsonb_build_object('profile', null, 'wallet', null);
    END IF;

    -- 2. Adjuntar la empresa (Relación 1:1 via PK en este esquema)
    SELECT to_jsonb(e) INTO v_empresas
    FROM public.empresas e
    WHERE e.id = p_user_id;

    -- Mezclar perfil + empresa
    IF v_empresas IS NOT NULL THEN
        v_profile := v_profile || jsonb_build_object('empresas', jsonb_build_array(v_empresas));
    ELSE
        v_profile := v_profile || jsonb_build_object('empresas', '[]'::jsonb);
    END IF;

    -- 3. Obtener estado de Billetera (Fail-Safe a 0 si no existe)
    SELECT to_jsonb(b) INTO v_wallet
    FROM public.billeteras b
    WHERE b.id = p_user_id;

    IF v_wallet IS NULL THEN
        v_wallet := jsonb_build_object('id', p_user_id, 'saldo', 0);
    END IF;

    -- 4. Construir el paquete completo y retornar (Instantáneo)
    vResult := jsonb_build_object(
        'profile', v_profile,
        'wallet', v_wallet
    );

    RETURN vResult;
EXCEPTION
    WHEN OTHERS THEN
        -- Retornar el error para que el frontend sepa qué pasó pero no cuelgue el app
        RETURN jsonb_build_object(
            'profile', null, 
            'wallet', null, 
            'error', SQLERRM,
            'hint', 'DATABASE_LOCK_OR_TIMEOUT'
        );
END;
$$;

-- Permisos (Aun siendo definer, hay que permitir la llamada)
GRANT EXECUTE ON FUNCTION public.rpc_get_user_boot_data(uuid) TO authenticated;
