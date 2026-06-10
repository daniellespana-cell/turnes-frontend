-- =========================================================================
-- SCRIPT: RECONTRATACIÓN V2 (FAST-TRACK TICKET)
-- =========================================================================
-- Una arquitectura limpia K.I.S.S. Crea una única "Vacante Matriz" por empresa
-- para alojar todas las recontrataciones sin ensuciar la base de datos con clones.

CREATE OR REPLACE FUNCTION rpc_rehire_fast_track(
    p_candidato_id UUID,
    p_offer_amount NUMERIC,
    p_offer_date TEXT,
    p_comision NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
    v_saldo_actual NUMERIC;
    v_matriz_vacante_id UUID;
    v_nueva_postulacion_id UUID;
BEGIN
    v_empresa_id := auth.uid();
    
    -- 1. Validar Identidad y Saldo
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Validar tabla de billeteras (Asegurarse de que exista)
    IF NOT EXISTS (SELECT 1 FROM public.billeteras WHERE id = v_empresa_id) THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_empresa_id, 0, now());
    END IF;

    SELECT saldo INTO v_saldo_actual FROM public.billeteras WHERE id = v_empresa_id;

    IF v_saldo_actual < p_comision THEN
        RAISE EXCEPTION 'SALDO_INSUFICIENTE';
    END IF;

    -- 2. Descontar y Registrar Comisión
    IF p_comision > 0 THEN
        UPDATE public.billeteras 
        SET saldo = saldo - p_comision, updated_at = now()
        WHERE id = v_empresa_id;

        INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, referencia)
        VALUES (v_empresa_id, 'RETIRO', p_comision, 'completado', 'COM_FAST_TRACK_' || extract(epoch from now()));
    END IF;

    -- 3. Crear un "TICKET DE TURNO DIRECTO" (Una vacante fantasma única por recontratación)
    -- Al crear una nueva por cada oferta, evitamos el error de "llave duplicada" 
    -- en postulaciones_vacante_id_user_id_key si se recontrata a la misma persona 2 veces.
    INSERT INTO public.vacantes (empresa_id, titulo, descripcion, pago_monto, fecha_turno, tipo_turno, status)
    VALUES (
        v_empresa_id, 
        '[TURNES] Ticket de Recontratación', 
        'Turno generado automáticamente vía Fast-Track directo', 
        0, -- El pago real se sobrescribe en la postulación
        p_offer_date::DATE, 
        'Directo', 
        'cerrada' -- NUNCA DEBE APARECER EN EL EXPLORER
    )
    RETURNING id INTO v_matriz_vacante_id;

    -- 4. Crear Nueva Postulación (El Ticket del Turno)
    INSERT INTO public.postulaciones (vacante_id, user_id, status, step, is_paid, protocol_state)
    VALUES (
        v_matriz_vacante_id, 
        p_candidato_id, 
        'agendado', 
        1, 
        true, 
        jsonb_build_object(
            'winner_takes_all', true, 
            'is_fast_track', true,
            'offer_amount', p_offer_amount,
            'offer_date', p_offer_date,
            'commission_paid', p_comision
        )
    )
    RETURNING id INTO v_nueva_postulacion_id;

    -- 5. Inyectar Mensaje de Sistema al Chat (Native Offer Bubble)
    INSERT INTO public.mensajes (conversacion_id, sender_id, content, tipo, metadata)
    VALUES (v_nueva_postulacion_id, v_empresa_id, 'Propuesta de Recontratación Directa', 'rehire_offer', jsonb_build_object(
        'subtype', 'rehire_offer',
        'intent', 'RECONTRATACION_DIRECTA',
        'price', p_offer_amount,
        'date', p_offer_date,
        'status', 'pending'
    ));

    RETURN jsonb_build_object('success', true, 'chat_id', v_nueva_postulacion_id);
END;
$$;

-- 🛡️ Aplicamos PERMISOS AUTOMÁTICAMENTE para que no de el error 42501
GRANT EXECUTE ON FUNCTION public.rpc_rehire_fast_track(UUID, NUMERIC, TEXT, NUMERIC) TO authenticated;
