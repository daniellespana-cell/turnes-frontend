-- 🛡️ RPC: MANAGE REHIRE ACTIONS (V2 - Blindado)
-- Objetivo: Centralizar la lógica de aceptación/rechazo de recontratación.
-- Seguridad: SECURITY DEFINER para ejecutar lógica de negocio protegida.
-- Mejoras V2: Guardia de estado para evitar reinicios de turnos activos.

CREATE OR REPLACE FUNCTION public.rpc_manage_rehire_actions(
    p_application_id uuid,
    p_action text -- 'ACCEPT' | 'DECLINE'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_current_status text;
    v_empresa_id uuid;
BEGIN
    v_user_id := auth.uid();

    -- 1. Validar existencia, pertenencia y obtener datos críticos
    SELECT p.status, v.empresa_id 
    INTO v_current_status, v_empresa_id
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id 
      AND (p.user_id = v_user_id OR v.empresa_id = v_user_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS';
    END IF;

    -- 2. Guardia de Estado: Solo permitir recontratación si el turno anterior ya acabó
    -- Esto evita que se reinicie un contrato que todavía está en curso.
    IF v_current_status NOT IN ('finalizado', 'calificado', 'rechazado') THEN
        RAISE EXCEPTION 'INVALID_STATE_FOR_REHIRE: Actual status es %', v_current_status;
    END IF;

    -- 3. Ejecutar Lógica de Negocio
    IF p_action = 'ACCEPT' THEN
        -- Reiniciar protocolo para exigir nuevo pago/proceso
        UPDATE public.postulaciones
        SET 
            step = 0, -- Regresa al inicio del protocolo
            is_paid = false,
            status = 'chat_iniciado',
            updated_at = now()
        WHERE id = p_application_id;
        
        RETURN jsonb_build_object('success', true, 'action', 'ACCEPTED');

    ELSIF p_action = 'DECLINE' THEN
        -- Cerrar el ciclo definitivamente
        UPDATE public.postulaciones
        SET 
            status = 'rechazado',
            step = 4, -- Finalizado
            updated_at = now()
        WHERE id = p_application_id;

        RETURN jsonb_build_object('success', true, 'action', 'DECLINED');

    ELSE
        RAISE EXCEPTION 'INVALID_ACTION: Solo se permite ACCEPT o DECLINE';
    END IF;

END;
$$;
