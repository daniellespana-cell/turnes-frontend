-- fix_worker_finance_credit.sql
-- 💰 CORRECCIÓN CRÍTICA: El trabajador debe recibir un movimiento INGRESO cuando la empresa
-- sella el turno con calificación. Sin este insert, la página de Finanzas del trabajador
-- aparece vacía aunque haya completado turnos.
--
-- Fix: rpc_rate_and_seal_v3 ahora escribe un movimiento INGRESO en la billetera del
-- candidato con el monto del turno (vacante.pago_monto) y el concepto descriptivo.

BEGIN;

DROP FUNCTION IF EXISTS rpc_rate_and_seal_v3(uuid, uuid, int, text, boolean);

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
    -- 💰 Nuevas variables para crédito al trabajador
    v_pago_monto NUMERIC;
    v_vacante_titulo TEXT;
BEGIN
    v_employer_id := auth.uid();

    -- 1. Validar propiedad y obtener estado + monto del turno
    SELECT p.vacante_id, p.status, p.protocol_state, v.pago_monto, v.titulo
    INTO v_vacante_id, v_status, v_protocol_state, v_pago_monto, v_vacante_titulo
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

    -- 2. Insertar la Calificación 'OCULTA'
    INSERT INTO reviews (target_id, author_id, shift_id, rating, comment, created_at)
    VALUES (p_candidate_id, v_employer_id, p_application_id, p_rating, p_comment, now());

    -- 3. Actualizar Protocol State
    v_protocol_state := v_protocol_state || jsonb_build_object(
        'empresa_rated', true,
        'asistio', p_asistio,
        'employer_rating_given', p_rating,
        'employer_comment_given', p_comment,
        'sealed_by', v_employer_id,
        'sealed_at', now()
    );

    IF v_candidato_rated THEN
        -- 🔥 DESBLOQUEO MUTUO
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_candidate_avg
        FROM reviews WHERE target_id = p_candidate_id;
        
        UPDATE perfiles SET calificacion = v_new_candidate_avg WHERE id = p_candidate_id;

        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) INTO v_new_employer_avg
        FROM reviews WHERE target_id = v_employer_id;
        
        UPDATE perfiles SET calificacion = v_new_employer_avg WHERE id = v_employer_id;

        v_protocol_state := v_protocol_state || jsonb_build_object('ratings_unlocked', true);
    END IF;

    -- 4. Sellar la postulación como finalizada
    UPDATE postulaciones
    SET status = 'finalizado',
        finalized_at = COALESCE(finalized_at, now()),
        protocol_state = v_protocol_state,
        updated_at = now()
    WHERE id = p_application_id;

    -- 5. 💰 NUEVO: Acreditar el pago al trabajador (solo si asistió y hay monto)
    --    Solo inserta si p_asistio es TRUE y el monto > 0 para evitar ingresos fantasma
    IF p_asistio = true AND v_pago_monto > 0 THEN
        -- Asegurar que la billetera del candidato exista (UPSERT defensivo)
        INSERT INTO billeteras (id, saldo)
        VALUES (p_candidate_id, 0)
        ON CONFLICT (id) DO NOTHING;

        -- Acreditar el saldo
        UPDATE billeteras
        SET saldo = saldo + v_pago_monto,
            updated_at = now()
        WHERE id = p_candidate_id;

        -- Registrar el movimiento en el historial de finanzas
        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
        VALUES (
            p_candidate_id,
            'INGRESO',
            v_pago_monto,
            'completado',
            COALESCE(v_vacante_titulo, 'Turno completado'),
            'SHIFT_PAYMENT:' || p_application_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'ratings_unlocked', v_candidato_rated,
        'status', 'finalizado',
        'credited', p_asistio AND v_pago_monto > 0
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_rate_and_seal_v3(uuid, uuid, int, text, boolean) TO authenticated;

COMMIT;
