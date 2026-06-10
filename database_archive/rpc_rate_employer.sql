-- rpc_rate_employer.sql
-- 🌟 RED DE CONFIANZA: MOTOR DE CALIFICACIÓN DEL TRABAJADOR A LA EMPRESA

BEGIN;

DROP FUNCTION IF EXISTS rpc_rate_employer(uuid, uuid, int, text);

CREATE OR REPLACE FUNCTION rpc_rate_employer(
    p_application_id UUID,
    p_employer_id UUID,
    p_rating INT,
    p_comment TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_worker_id UUID;
    v_vacante_id UUID;
    v_actual_employer_id UUID;
    v_protocol_state JSONB;
    v_empresa_rated BOOLEAN;
    v_new_candidate_avg NUMERIC;
    v_new_employer_avg NUMERIC;
BEGIN
    v_worker_id := auth.uid();

    -- 1. Validar participación en el contrato (Candidato)
    SELECT p.vacante_id, p.protocol_state, v.empresa_id 
    INTO v_vacante_id, v_protocol_state, v_actual_employer_id
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND p.user_id = v_worker_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'UNAUTHORIZED: No participaste en esta postulación.'; 
    END IF;

    IF v_actual_employer_id != p_employer_id THEN
        RAISE EXCEPTION 'CONFLICT: Discrepancia en el ID de la Empresa destino.';
    END IF;

    -- Extraer info del protocolo
    v_protocol_state := COALESCE(v_protocol_state, '{}'::jsonb);
    IF (v_protocol_state->>'candidato_rated')::boolean = true THEN
        RAISE EXCEPTION 'ALREADY_RATED: Ya has calificado esta experiencia.';
    END IF;

    v_empresa_rated := COALESCE((v_protocol_state->>'empresa_rated')::boolean, false);

    -- 2. Insertar la Calificación 'OCULTA' del candidato hacia la empresa
    INSERT INTO reviews (target_id, author_id, shift_id, rating, comment, created_at)
    VALUES (p_employer_id, v_worker_id, p_application_id, p_rating, p_comment, now());

    -- 3. Actualizar Protocol State de la Postulación
    v_protocol_state := v_protocol_state || jsonb_build_object(
        'candidato_rated', true,
        'worker_rating_given', p_rating,
        'worker_comment_given', p_comment
    );

    IF v_empresa_rated THEN
        -- 🔥 DESBLOQUEO MUTUO: La empresa ya había calificado, así que este es el 2do voto.
        -- Recalculamos promedios para ambos.
        
        -- Promedio Candidato
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_candidate_avg
        FROM reviews WHERE target_id = v_worker_id;
        
        UPDATE perfiles SET calificacion = v_new_candidate_avg WHERE id = v_worker_id;

        -- Promedio Empresa
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_employer_avg
        FROM reviews WHERE target_id = p_employer_id;
        
        UPDATE perfiles SET calificacion = v_new_employer_avg WHERE id = p_employer_id;

        v_protocol_state := v_protocol_state || jsonb_build_object('ratings_unlocked', true);
    END IF;

    -- Guardamos el nuevo estado del JSON
    UPDATE postulaciones
    SET protocol_state = v_protocol_state,
        status = 'finalizado',  -- 🎯 KEY FIX: Mover al historial y a "Completadas" de empresa
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
        'success', true, 
        'ratings_unlocked', v_empresa_rated
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_rate_employer(uuid, uuid, int, text) TO authenticated;

COMMIT;
