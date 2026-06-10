-- rpc_manage_chat_visibility.sql
-- Control de Visibilidad de Chats (Archivar, Bloquear, Eliminar)
-- Mantiene el historial íntegro usando el JSONB protocol_state para aislamiento de visibilidad K.I.S.S.

BEGIN;

CREATE OR REPLACE FUNCTION rpc_manage_chat_visibility(p_chat_id uuid, p_action text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_protocol_state jsonb;
    v_empresa_id uuid;
    v_candidato_id uuid;
    v_is_authorized boolean := false;
    v_visibility jsonb;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    IF p_action NOT IN ('archive', 'unarchive', 'block', 'delete') THEN
        RAISE EXCEPTION 'INVALID_ACTION';
    END IF;

    -- Obtener datos de la postulación
    SELECT p.protocol_state, v.empresa_id, p.user_id 
    INTO v_protocol_state, v_empresa_id, v_candidato_id
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_chat_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'CHAT_NOT_FOUND';
    END IF;

    -- Verificar que el usuario pertenece a este chat (es el candidato o es la empresa)
    IF v_user_id = v_candidato_id OR v_user_id = v_empresa_id THEN
        v_is_authorized := true;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'UNAUTHORIZED_CHAT_ACCESS';
    END IF;

    -- Extraer el bloque de visibilidad actual o inicializarlo vacío
    v_protocol_state := COALESCE(v_protocol_state, '{}'::jsonb);
    v_visibility := COALESCE(v_protocol_state->'visibility', '{}'::jsonb);

    -- Actualizar el estado para el usuario específico (isolation)
    -- Si es 'unarchive', borramos la clave para limpiar el JSON
    IF p_action = 'unarchive' THEN
        v_visibility := v_visibility - v_user_id::text;
    ELSE
        v_visibility := jsonb_set(v_visibility, ARRAY[v_user_id::text], to_jsonb(p_action));
    END IF;

    -- Guardar el nuevo protocolo local
    v_protocol_state := jsonb_set(v_protocol_state, ARRAY['visibility'], v_visibility);

    -- Persistir en la base de datos sin alterar step o status principales
    UPDATE postulaciones 
    SET protocol_state = v_protocol_state,
        updated_at = now()
    WHERE id = p_chat_id;

    RETURN jsonb_build_object('success', true, 'action', p_action, 'applied_to', v_user_id);
END;
$$;

-- Otorgar Privilegios
GRANT EXECUTE ON FUNCTION public.rpc_manage_chat_visibility(uuid, text) TO authenticated;

COMMIT;
