-- fix_chat_rate_and_seal_v2.sql
-- 🌟 RED DE CONFIANZA: MOTOR DE CALIFICACIÓN Y SELLADO (RATING ENGINE)

BEGIN;

DROP FUNCTION IF EXISTS rpc_rate_and_seal_v2(uuid, uuid, int, text, boolean);

CREATE OR REPLACE FUNCTION rpc_rate_and_seal_v2(
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
    v_new_avg NUMERIC;
BEGIN
    v_employer_id := auth.uid();

    -- 1. Validar propiedad y obtener estado de la postulación
    SELECT p.vacante_id, p.status INTO v_vacante_id, v_status
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND v.empresa_id = v_employer_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'UNAUTHORIZED: No eres dueño de esta vacante o la postulación no existe.'; 
    END IF;

    IF v_status = 'finalizado' THEN
        RAISE EXCEPTION 'ALREADY_SEALED: Esta postulación ya fue calificada y finalizada.';
    END IF;

    -- 2. Insertar la Calificación en la tabla Reviews
    -- Guardamos comentario, calificacion, apuntando al candidato, creado por la empresa, ligado al turno (postulacion)
    INSERT INTO reviews (target_id, author_id, shift_id, rating, comment, created_at)
    VALUES (p_candidate_id, v_employer_id, p_application_id, p_rating, p_comment, now());

    -- 3. Calcular el nuevo promedio Global del Candidato (Cálculo Atómico)
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_avg
    FROM reviews
    WHERE target_id = p_candidate_id;

    -- 4. Actualizar el Perfil del Candidato (Score Global)
    UPDATE perfiles
    SET calificacion = v_new_avg
    WHERE id = p_candidate_id;

    -- 5. Sellar la Postulación (Finalizar Turno) + Guardar Metadata de Asistencia
    UPDATE postulaciones
    SET status = 'finalizado',
        finalized_at = now(),
        protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object(
            'asistio', p_asistio,
            'rating_given', p_rating,
            'comment_given', p_comment,
            'sealed_by', v_employer_id,
            'sealed_at', now()
        ),
        updated_at = now()
    WHERE id = p_application_id;

    -- Devolver Resultado Exitoso
    RETURN jsonb_build_object(
        'success', true, 
        'new_status', 'finalizado', 
        'candidate_new_rating', v_new_avg
    );
END;
$$;

-- Otorgar Permisos
GRANT EXECUTE ON FUNCTION public.rpc_rate_and_seal_v2(uuid, uuid, int, text, boolean) TO authenticated;

COMMIT;
