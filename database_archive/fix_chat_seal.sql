-- fix_chat_seal.sql
-- Drop any previous versions to ensure clean slate
DROP FUNCTION IF EXISTS rpc_seal_chat(uuid);

CREATE OR REPLACE FUNCTION rpc_seal_chat(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_current_step int;
    v_status varchar;
    v_vacante_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Verify ownership (Empresa) and get vacante_id
    SELECT p.step, p.status, p.vacante_id INTO v_current_step, v_status, v_vacante_id
    FROM postulaciones p 
    JOIN vacantes v ON v.id = p.vacante_id 
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    
    -- Aceptamos 'contratado', 'chat_iniciado', 'agendado' (Rehire) o 'pendiente' por si el parche 3 no pasó
    IF v_status NOT IN ('contratado', 'chat_iniciado', 'pendiente', 'agendado') THEN 
        RAISE EXCEPTION 'NOT_CONTRACTED_YET_STATUS_IS_%', v_status; 
    END IF;
    
    -- Sellamos el chat avanzando al paso 4, pero FORZAMOS el status en 'contratado' 
    -- para que se pinte la tarjeta de Calificar en la UI de Red de Confianza ("pendientes")
    UPDATE postulaciones 
    SET step = 4, 
        status = 'contratado',
        protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('step4_sealed_at', now()), 
        updated_at = now()
    WHERE id = p_application_id;

    -- Winner-Takes-All: Sincronizar el Feed global cerrando la Vacante
    UPDATE vacantes
    SET status = 'cerrada', closed_at = now()
    WHERE id = v_vacante_id;

    RETURN jsonb_build_object('success', true, 'new_status', 'contratado', 'step', 4);
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.rpc_seal_chat(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_seal_chat(uuid) TO service_role;
