-- business_rules_protocol_step4.sql
-- Función para Cerrar el ciclo del chat pero mantener la postulación en 'contratado' para pasar a calificación.

BEGIN;

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
BEGIN
    v_user_id := auth.uid();
    
    -- Verify ownership
    SELECT p.step, p.status INTO v_current_step, v_status
    FROM postulaciones p 
    JOIN vacantes v ON v.id = p.vacante_id 
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    IF v_status NOT IN ('contratado', 'chat_iniciado') THEN RAISE EXCEPTION 'NOT_CONTRACTED_YET'; END IF;
    
    -- Sellamos el chat avanzando al paso 4, pero FORZAMOS el status en 'contratado' 
    -- para que se pinte la tarjeta de Calificar en la UI de Red de Confianza ("pendientes")
    UPDATE postulaciones 
    SET step = 4, 
        status = 'contratado',
        protocol_state = protocol_state || jsonb_build_object('step4_sealed_at', now()), 
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Otorgar permiso de ejecución al rol frontend
GRANT EXECUTE ON FUNCTION public.rpc_seal_chat(uuid) TO authenticated;

COMMIT;
