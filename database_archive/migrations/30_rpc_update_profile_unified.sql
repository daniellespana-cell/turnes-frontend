-- 🚀 30_rpc_update_profile_unified.sql
-- OBJETIVO: Eliminar la "doble escritura" del frontend.
-- Mueve la responsabilidad de actualizar el perfil y la empresa a una sola transacción atómica (ACID).
-- Usa jsonb_populate_record para asignación segura de columnas permitidas.

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_update_user_profile(
    p_user_id UUID,
    p_perfiles_payload JSONB,
    p_empresas_payload JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Permite a la función actualizar sin problemas de RLS complejos, pero validamos la identidad dentro
AS $$
DECLARE
    v_updated_perfil JSONB;
BEGIN
    -- 1. Validar Identidad (Zero Trust)
    -- El usuario solo puede actualizar su propio perfil, a menos que sea un Service Role
    IF auth.uid() != p_user_id AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Acceso denegado: No tienes permiso para modificar este perfil';
    END IF;

    -- 2. Actualizar tabla perfiles de forma dinámica pero segura
    IF p_perfiles_payload IS NOT NULL AND p_perfiles_payload::text != '{}' THEN
        UPDATE public.perfiles AS p
        SET 
            nombre_display = new_data.nombre_display,
            telefono = new_data.telefono,
            bio = new_data.bio,
            avatar_url = new_data.avatar_url,
            direccion = new_data.direccion,
            lat = new_data.lat,
            lng = new_data.lng,
            nombre_empresa = new_data.nombre_empresa,
            nit = new_data.nit,
            sector = new_data.sector,
            disponibilidad = new_data.disponibilidad,
            experiencia_anios = new_data.experiencia_anios,
            plan = new_data.plan,
            configuraciones = new_data.configuraciones,
            on_vacation = new_data.on_vacation,
            -- Habilidades requieren manejo especial porque en la DB es un ARRAY, y desde JSONB llega diferente
            skills = CASE 
                        WHEN p_perfiles_payload ? 'skills' THEN 
                            ARRAY(SELECT jsonb_array_elements_text(p_perfiles_payload->'skills')) 
                        ELSE p.skills 
                     END
        FROM jsonb_populate_record(p, p_perfiles_payload) AS new_data
        WHERE p.id = p_user_id;
    END IF;

    -- 3. Actualizar tabla empresas si aplica
    IF p_empresas_payload IS NOT NULL AND p_empresas_payload::text != '{}' THEN
        UPDATE public.empresas AS e
        SET 
            nombre_comercial = new_data.nombre_comercial,
            nit_rut = new_data.nit_rut,
            sector_industrial = new_data.sector_industrial,
            logo_url = new_data.logo_url,
            lat = new_data.lat,
            lng = new_data.lng
        FROM jsonb_populate_record(e, p_empresas_payload) AS new_data
        WHERE e.id = p_user_id;
    END IF;

    -- 4. Retornar el perfil actualizado para que el Frontend hidrate la sesión
    SELECT row_to_json(p.*)::JSONB INTO v_updated_perfil
    FROM public.perfiles p
    WHERE p.id = p_user_id;

    RETURN v_updated_perfil;
END;
$$;

-- Otorgar permisos de ejecución a los usuarios autenticados
GRANT EXECUTE ON FUNCTION public.rpc_update_user_profile(UUID, JSONB, JSONB) TO authenticated;

COMMIT;

-- Aviso Final
DO $$
BEGIN
    RAISE NOTICE '✅ RPC rpc_update_user_profile creado exitosamente.';
END $$;
