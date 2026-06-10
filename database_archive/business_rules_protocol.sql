-- business_rules_protocol.sql
-- Implementación de Límites de Videos y Efecto Indriver ("Winner-Takes-All") para la contratación.

BEGIN;

-- 1. Función para solicitar videollamada (Límite de 4 por vacante)
CREATE OR REPLACE FUNCTION rpc_request_video_validation(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_vacante_id uuid;
    v_video_count int;
    v_protocol_state jsonb;
BEGIN
    v_user_id := auth.uid();
    
    -- Verify ownership and get vacante_id
    SELECT p.vacante_id, p.protocol_state INTO v_vacante_id, v_protocol_state
    FROM postulaciones p 
    JOIN vacantes v ON v.id = p.vacante_id 
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    
    -- Idempotencia: Si ya lo pidió antes, se le respeta el ticket
    IF (v_protocol_state->>'video_requested') = 'true' THEN
        RETURN jsonb_build_object('success', true);
    END IF;

    -- Cuenta de tickets gastados
    SELECT count(*) INTO v_video_count
    FROM postulaciones
    WHERE vacante_id = v_vacante_id 
      AND (protocol_state->>'video_requested') = 'true';

    IF v_video_count >= 4 THEN
        RAISE EXCEPTION 'MAX_VIDEO_VALIDATIONS_REACHED';
    END IF;

    -- Setear ticket
    UPDATE postulaciones 
    SET step = GREATEST(step, 2),
        protocol_state = protocol_state || jsonb_build_object(
            'video_requested', true, 
             'video_requested_at', now()
        ),
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true, 'remaining', 3 - v_video_count);
END;
$$;


-- 2. Función para obtener stats de la vacante (Para el contador del UI frontend)
CREATE OR REPLACE FUNCTION rpc_get_video_stats(p_vacante_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_video_count int;
BEGIN
    SELECT count(*) INTO v_video_count
    FROM postulaciones
    WHERE vacante_id = p_vacante_id 
      AND (protocol_state->>'video_requested') = 'true';

    RETURN jsonb_build_object('used', v_video_count, 'total', 4, 'remaining', GREATEST(0, 4 - v_video_count));
END;
$$;


-- 3. Parche al Paso 3 - Confirmar Acuerdo (Winner-Takes-All Indriver)
CREATE OR REPLACE FUNCTION rpc_confirm_agreement(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_vacante_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    SELECT p.vacante_id INTO v_vacante_id
    FROM postulaciones p 
    JOIN vacantes v ON v.id = p.vacante_id 
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND is_paid = true) THEN RAISE EXCEPTION 'PAYMENT_REQUIRED'; END IF;
    
    -- A) Marcar al ganador
    UPDATE postulaciones 
    SET step = 3, status = 'contratado', protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('step3_confirmed_at', now(), 'winner_takes_all', true), updated_at = now()
    WHERE id = p_application_id;

    -- B) Rechazar a los demás candidatos de esta vacante ("Efecto Indriver")
    UPDATE postulaciones
    SET status = 'rechazado', updated_at = now()
    WHERE vacante_id = v_vacante_id AND id != p_application_id;

    -- C) Desactivar la vacante (Retirarla del feed público)
    -- Asumiendo que status es de esquema enum 'estado_vacante_enum' u varchar
    UPDATE vacantes
    SET status = 'cerrada', closed_at = now(), updated_at = now()
    WHERE id = v_vacante_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

COMMIT;
