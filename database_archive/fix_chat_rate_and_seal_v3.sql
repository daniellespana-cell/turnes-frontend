-- fix_chat_rate_and_seal_v3.sql
-- 🌟 RED DE CONFIANZA: MOTOR DE CALIFICACIÓN Y SELLADO (DOUBLE BLIND)

BEGIN;

DROP FUNCTION IF EXISTS rpc_rate_and_seal_v2(uuid, uuid, int, text, boolean);
DROP FUNCTION IF EXISTS rpc_rate_and_seal_v3(uuid, uuid, int, text, boolean);

-- FUNCION PARA QUE LA EMPRESA CALIFIQUE AL CANDIDATO
CREATE OR REPLACE FUNCTION rpc_rate_and_seal_v3(
    p_application_id UUID,
    p_candidate_id UUID,
    p_rating INT,
    p_comment TEXT,
    p_asistio BOOLEAN
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_employer_id UUID;
    v_vacante_id UUID;
    v_status TEXT;
    v_protocol_state JSONB;
    v_candidato_rated BOOLEAN;
    v_new_candidate_avg NUMERIC;
    v_new_employer_avg NUMERIC;
BEGIN
    v_employer_id := auth.uid();

    -- 1. Validar propiedad y obtener estado
    SELECT p.vacante_id, p.status, p.protocol_state INTO v_vacante_id, v_status, v_protocol_state
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND v.empresa_id = v_employer_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'UNAUTHORIZED: No eres dueño de esta vacante o la postulación no existe.'; 
    END IF;

    -- Extraer info del protocolo
    v_protocol_state := COALESCE(v_protocol_state, '{}'::jsonb);
    IF (v_protocol_state->>'empresa_rated')::boolean = true THEN
        RAISE EXCEPTION 'ALREADY_RATED: La empresa ya ha emitido su calificación para este turno.';
    END IF;

    v_candidato_rated := COALESCE((v_protocol_state->>'candidato_rated')::boolean, false);

    -- 2. Insertar la Calificación 'OCULTA' (No afecta promedio aún salvo que sea el último)
    INSERT INTO reviews (target_id, author_id, shift_id, rating, comment, created_at)
    VALUES (p_candidate_id, v_employer_id, p_application_id, p_rating, p_comment, now());

    -- 3. Actualizar Protocol State de la Postulación
    v_protocol_state := v_protocol_state || jsonb_build_object(
        'empresa_rated', true,
        'asistio', p_asistio,
        'employer_rating_given', p_rating,
        'employer_comment_given', p_comment,
        'sealed_by', v_employer_id,
        'sealed_at', now()
    );

    IF v_candidato_rated THEN
        -- 🔥 DESBLOQUEO MUTUO: El Candidato ya había calificado, así que este es el 2do voto.
        -- Recalculamos promedios para ambos.
        
        -- Promedio Candidato
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_candidate_avg
        FROM reviews WHERE target_id = p_candidate_id;
        
        UPDATE perfiles SET calificacion = v_new_candidate_avg WHERE id = p_candidate_id;

        -- Promedio Empresa
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_employer_avg
        FROM reviews WHERE target_id = v_employer_id;
        
        UPDATE perfiles SET calificacion = v_new_employer_avg WHERE id = v_employer_id;

        v_protocol_state := v_protocol_state || jsonb_build_object('ratings_unlocked', true);
    END IF;

    -- Siempre sellamos del lado de la empresa poniéndolo en finalizado para que pase a su historial
    UPDATE postulaciones
    SET status = 'finalizado',
        finalized_at = COALESCE(finalized_at, now()),
        protocol_state = v_protocol_state,
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
        'success', true, 
        'ratings_unlocked', v_candidato_rated,
        'status', 'finalizado'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_rate_and_seal_v3(uuid, uuid, int, text, boolean) TO authenticated;

COMMIT;
