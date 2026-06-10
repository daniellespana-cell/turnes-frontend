CREATE OR REPLACE FUNCTION rpc_decline_rehire_offer(
    p_mensaje_id UUID,
    p_postulacion_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_protocol_state JSONB;
    v_comision NUMERIC;
    v_empresa_id UUID;
BEGIN
    -- 1. Actualizar el Mensaje a declinado
    UPDATE public.mensajes
    SET metadata = jsonb_set(metadata, '{status}', '"declined"')
    WHERE id = p_mensaje_id AND tipo = 'rehire_offer';

    -- 2. Obtener la postulación y sus detalles
    SELECT protocol_state, (SELECT empresa_id FROM public.vacantes v WHERE v.id = p.vacante_id)
    INTO v_protocol_state, v_empresa_id
    FROM public.postulaciones p
    WHERE id = p_postulacion_id;

    -- 3. Actualizar la Postulación a rechazada
    UPDATE public.postulaciones
    SET status = 'rechazado', 
        updated_at = now()
    WHERE id = p_postulacion_id;

    -- 4. Reembolsar comisión si se había cobrado (Fast-Track)
    v_comision := COALESCE((v_protocol_state->>'commission_paid')::NUMERIC, 0);
    IF v_comision > 0 THEN
        UPDATE public.billeteras
        SET saldo = saldo + v_comision, updated_at = now()
        WHERE id = v_empresa_id;

        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, referencia)
        VALUES (v_empresa_id, 'REEMBOLSO', v_comision, 'completado', 'REFUND_FAST_TRACK_' || extract(epoch from now()));
    END IF;

    -- 5. Mandar un mensaje de sistema
    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (
        p_postulacion_id, 
        auth.uid(), 
        'El talento ha declinado la oferta de recontratación.', 
        'system_info',
        jsonb_build_object('subtype', 'rehire_declined')
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_decline_rehire_offer(UUID, UUID) TO authenticated;
