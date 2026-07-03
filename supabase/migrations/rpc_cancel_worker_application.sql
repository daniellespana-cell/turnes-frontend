-- rpc_cancel_worker_application.sql
CREATE OR REPLACE FUNCTION public.rpc_cancel_worker_application(p_application_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_postulacion RECORD;
BEGIN
    -- 1. Obtener el ID del usuario autenticado
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- 2. Verificar que la postulación exista y pertenezca al usuario
    SELECT * INTO v_postulacion
    FROM public.postulaciones
    WHERE id = p_application_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Postulación no encontrada o no tienes permisos para cancelarla';
    END IF;

    -- 3. Actualizar el estado a cancelado
    UPDATE public.postulaciones
    SET status = 'cancelado',
        updated_at = NOW()
    WHERE id = p_application_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Postulación cancelada con éxito',
        'id', p_application_id
    );
END;
$$;
