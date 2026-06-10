-- 🛠️ 26_rpc_hire_candidate_v2.sql
-- OBJETIVO: Implementar la contratación atómica con notificaciones automáticas y cierre de vacante.

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_hire_candidate_v2(
    p_application_id UUID,
    p_vacancy_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_employer_id UUID;
    v_winner_user_id UUID;
    v_vacancy_title TEXT;
    v_company_name TEXT;
    v_cupos_totales INT;
    v_cupos_ocupados INT;
    v_is_full BOOLEAN;
BEGIN
    v_employer_id := auth.uid();

    -- 1. VALIDACIÓN DE SEGURIDAD Y PROPIEDAD
    SELECT v.titulo, e.nombre_comercial, v.cupos_disponibles 
    INTO v_vacancy_title, v_company_name, v_cupos_totales
    FROM public.vacantes v
    JOIN public.empresas e ON e.id = v.empresa_id
    WHERE v.id = p_vacancy_id AND v.empresa_id = v_employer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED: No tienes permisos sobre esta vacante o no existe.';
    END IF;

    -- 2. VALIDACIÓN DE CUPOS (Prevenir sobre-contratación)
    SELECT COUNT(*) INTO v_cupos_ocupados
    FROM public.postulaciones
    WHERE vacante_id = p_vacancy_id AND status = 'contratado';

    IF v_cupos_ocupados >= v_cupos_totales THEN
        RAISE EXCEPTION 'VACANCY_FULL: Todos los cupos para esta vacante ya han sido cubiertos.';
    END IF;

    -- 3. OBTENER ID DEL GANADOR
    SELECT user_id INTO v_winner_user_id
    FROM public.postulaciones
    WHERE id = p_application_id;

    -- 4. ACTUALIZACIÓN ATÓMICA: EL GANADOR
    UPDATE public.postulaciones
    SET status = 'contratado',
        updated_at = now()
    WHERE id = p_application_id;

    -- 5. NOTIFICACIÓN AL GANADOR
    INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
    VALUES (
        v_winner_user_id,
        'MATCH_ESTABLISHED',
        p_application_id,
        jsonb_build_object(
            'companyName', v_company_name,
            'jobTitle', v_vacancy_title,
            'message', '¡Felicidades! Has sido seleccionado para el puesto.'
        )
    );

    -- 6. ¿ES EL ÚLTIMO CUPO? (Cierre masivo si aplica)
    IF (v_cupos_ocupados + 1) >= v_cupos_totales THEN
        -- A) Cerrar la vacante
        UPDATE public.vacantes
        SET status = 'cerrada',
            updated_at = now()
        WHERE id = p_vacancy_id;

        -- B) Notificar y Finalizar a los demás (Opcional pero Senior)
        -- Notificar a los que se quedaron en Pendiente o Chat Abierto
        INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
        SELECT 
            user_id,
            'VACANCY_CLOSED',
            p_vacancy_id,
            jsonb_build_object(
                'companyName', v_company_name,
                'jobTitle', v_vacancy_title,
                'message', 'La vacante ha sido cubierta por otro candidato. ¡Gracias por participar!'
            )
        FROM public.postulaciones
        WHERE vacante_id = p_vacancy_id 
          AND id != p_application_id 
          AND status IN ('pendiente', 'chat_abierto', 'visto');

        -- C) Limpiar estados de los demás
        UPDATE public.postulaciones
        SET status = 'finalizado',
            updated_at = now()
        WHERE vacante_id = p_vacancy_id 
          AND id != p_application_id 
          AND status IN ('pendiente', 'chat_abierto', 'visto');
          
        v_is_full := TRUE;
    ELSE
        v_is_full := FALSE;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'vacancy_closed', v_is_full,
        'winner_notified', true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_hire_candidate_v2(uuid, uuid) TO authenticated;

COMMIT;
