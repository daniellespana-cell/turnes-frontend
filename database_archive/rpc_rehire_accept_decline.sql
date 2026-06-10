-- rpc_rehire_accept_decline.sql
-- Manejadores de Aceptación y Declinación de Ofertas Fast-Track (Recontratación Directa)

BEGIN;

-- ==============================================================================
-- 1. ACEPTAR OFERTA
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_accept_rehire_offer(p_mensaje_id uuid, p_postulacion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_msg_metadata jsonb;
    v_chat_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Verificar que la postulación pertenece al candidato actual
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_postulacion_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Obtener metadata del mensaje y conversacion_id
    SELECT metadata, conversacion_id INTO v_msg_metadata, v_chat_id
    FROM mensajes 
    WHERE id = p_mensaje_id AND tipo = 'rehire_offer';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'OFFER_MESSAGE_NOT_FOUND';
    END IF;

    IF v_msg_metadata->>'status' != 'pending' THEN
        RAISE EXCEPTION 'OFFER_ALREADY_RESOLVED';
    END IF;

    -- Actualizar el mensaje: status = 'accepted'
    UPDATE mensajes
    SET metadata = v_msg_metadata || jsonb_build_object('status', 'accepted')
    WHERE id = p_mensaje_id;

    -- ⭐ MAGIA SENIOR (FAST-TRACK): Saltar burocracia.
    -- Al aceptar una recontratación, TODO está pactado. Pasamos directo a 'contratado' (Step 3).
    -- Esto salta toda la parafernalia de videollamadas y selecciones de la bolsa pública.
    UPDATE postulaciones
    SET step = 3,
        status = 'contratado',
        protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('rehire_accepted', true, 'rehire_accepted_at', now()),
        updated_at = now()
    WHERE id = p_postulacion_id;

    -- Inyectar un mensaje de sistema para notificar en la conversación
    INSERT INTO mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (
        v_chat_id, 
        v_user_id, 
        'Oferta de Recontratación Aceptada por el Talento', 
        'system_info', 
        jsonb_build_object('subtype', 'rehire_accepted')
    );

    RETURN jsonb_build_object('success', true);
END;
$$;


-- ==============================================================================
-- 2. DECLINAR OFERTA Y APLICAR REEMBOLSO (KISS 2026)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_decline_rehire_offer(p_mensaje_id uuid, p_postulacion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_empresa_id uuid;
    v_commission numeric;
    v_msg_metadata jsonb;
    v_chat_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Verificar propiedad de postulacion y obtener datos de comision pagada
    SELECT p.protocol_state->>'commission_paid', v.empresa_id INTO v_commission, v_empresa_id
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_postulacion_id AND p.user_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

    -- Obtener metadata del mensaje y conversacion_id
    SELECT metadata, conversacion_id INTO v_msg_metadata, v_chat_id
    FROM mensajes 
    WHERE id = p_mensaje_id AND tipo = 'rehire_offer';

    IF NOT FOUND THEN RAISE EXCEPTION 'OFFER_MESSAGE_NOT_FOUND'; END IF;
    IF v_msg_metadata->>'status' != 'pending' THEN RAISE EXCEPTION 'OFFER_ALREADY_RESOLVED'; END IF;

    -- 1. Actualizar el mensaje: status = 'declined'
    UPDATE mensajes
    SET metadata = v_msg_metadata || jsonb_build_object('status', 'declined')
    WHERE id = p_mensaje_id;

    -- 2. Emitir Reembolso Automático a la Empresa (si aplica)
    IF v_commission IS NOT NULL AND v_commission > 0 THEN
        UPDATE billeteras 
        SET saldo = COALESCE(saldo, 0) + v_commission, updated_at = now()
        WHERE id = v_empresa_id;

        -- Registrar en historial de billetera
        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, referencia)
        VALUES (v_empresa_id, 'DEPOSITO', v_commission, 'completado', 'REFUND_FAST_TRACK_' || extract(epoch from now()));
    END IF;

    -- 3. Cerrar el ciclo (Rechazado)
    UPDATE postulaciones
    SET status = 'rechazado', protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('rehire_declined', true, 'refunded_amount', v_commission)
    WHERE id = p_postulacion_id;

    -- 4. Inyectar un mensaje de sistema para notificar en la conversación
    INSERT INTO mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (
        v_chat_id, 
        v_user_id, 
        'Oferta de Recontratación Declinada por el Talento', 
        'system_info', 
        jsonb_build_object('subtype', 'rehire_declined')
    );

    RETURN jsonb_build_object('success', true, 'refunded', v_commission);
END;
$$;

-- Otorgar Privilegios
GRANT EXECUTE ON FUNCTION public.rpc_accept_rehire_offer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_decline_rehire_offer(uuid, uuid) TO authenticated;

COMMIT;
