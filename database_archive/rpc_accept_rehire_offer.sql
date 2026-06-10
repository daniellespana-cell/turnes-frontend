CREATE OR REPLACE FUNCTION rpc_accept_rehire_offer(
    p_mensaje_id UUID,
    p_postulacion_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Actualizar el Mensaje a aceptado
    UPDATE public.mensajes
    SET metadata = jsonb_set(metadata, '{status}', '"accepted"')
    WHERE id = p_mensaje_id AND tipo = 'rehire_offer';

    -- 2. Actualizar Postulación al Step 3 (Acuerdo Confirmado)
    UPDATE public.postulaciones
    SET step = 3, 
        status = 'agendado', 
        updated_at = now()
    WHERE id = p_postulacion_id;

    -- 3. Mandar un mensaje de sistema avisando a la empresa que el candidato aceptó el turno
    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (
        p_postulacion_id, 
        auth.uid(), 
        'El talento ha aceptado la oferta de recontratación. El turno está oficialmente agendado.', 
        'system_info',
        jsonb_build_object('subtype', 'rehire_accepted')
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_accept_rehire_offer(UUID, UUID) TO authenticated;
