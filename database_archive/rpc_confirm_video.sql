-- RPC: Validar Video (Paso 2)
-- Función Security Definer (Bypass RLS) para que tanto Empresa como Postulante puedan confirmar que la validación visual ocurrió y avanzar la máquina de estados.

BEGIN;

-- ⚠️ DROP requerido para cambiar tipo de retorno (json → jsonb)
DROP FUNCTION IF EXISTS public.rpc_confirm_video(UUID);

CREATE OR REPLACE FUNCTION public.rpc_confirm_video(
    p_application_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_postulacion RECORD;
BEGIN
    -- 1. Obtener la postulación
    SELECT * INTO v_postulacion
    FROM postulaciones
    WHERE id = p_application_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'POSTULACION_NOT_FOUND';
    END IF;

    -- 2. Validar que el pago ya se haya realizado (Paso 1)
    IF v_postulacion.is_paid IS NOT TRUE THEN
        RAISE EXCEPTION 'UNAUTHORIZED: El contacto no ha sido desbloqueado.';
    END IF;

    -- 3. Avanzar estado a VALIDADO
    UPDATE postulaciones
    SET 
        step = 2, -- PROTOCOL_STEPS.VIDEO_VALIDATED
        protocol_state = jsonb_set(
            COALESCE(protocol_state, '{}'::jsonb),
            '{video_validated}',
            'true'
        ),
        updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Validación visual registrada con éxito.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_confirm_video(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_confirm_video(UUID) TO anon;

COMMIT;
