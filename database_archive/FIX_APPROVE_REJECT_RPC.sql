-- ==============================================================================
-- FIX DEFINITIVO: rpc_approve_verification + rpc_reject_verification
-- Auditado contra el esquema real de cada tabla:
--   notificaciones: user_id, tipo, reference_id, metadata (NO tiene mensaje)
--   movimientos:    billetera_id, tipo (DEPOSITO|RETIRO|PAGO_SERVICIO|COMISION), monto, concepto, referencia
--   billeteras:     id (FK auth.users), saldo
--   empresas:       id (FK perfiles), validacion_estado (NO tiene verificado/updated_at)
-- ==============================================================================

-- ─── APPROVE ──────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.rpc_approve_verification(uuid, text);
CREATE OR REPLACE FUNCTION public.rpc_approve_verification(
    p_request_id UUID,
    p_notes      TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_admin_id    UUID;
    v_is_admin    BOOLEAN;
    v_target_user UUID;
    v_user_role   TEXT;
BEGIN
    v_admin_id := auth.uid();

    -- Verificar que quien llama es admin
    SELECT (rol::text = 'admin') INTO v_is_admin
    FROM perfiles WHERE id = v_admin_id;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Solo administradores pueden aprobar verificaciones.';
    END IF;

    -- Obtener datos de la solicitud
    SELECT user_id, user_role INTO v_target_user, v_user_role
    FROM verification_requests
    WHERE id = p_request_id AND status IN ('pending', 'in_review');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'REQUEST_NOT_FOUND: Solicitud no encontrada o ya procesada.';
    END IF;

    -- Actualizar solicitud
    UPDATE verification_requests
    SET status      = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        admin_notes = p_notes,
        updated_at  = now()
    WHERE id = p_request_id;

    -- 🚀 FIX ELITE: Marcar usuario como verificado en perfiles
    UPDATE perfiles
    SET verificado = true, updated_at = now()
    WHERE id = v_target_user;

    -- 🏢 SINCRONIZACIÓN EMPRESA: Asegurar insignia en ambas tablas
    UPDATE empresas 
    SET 
        verificado = true, 
        validacion_estado = 'aprobado',
        updated_at = now()
    WHERE id = v_target_user;

    -- Notificación (notificaciones NO tiene columna 'mensaje' — usar metadata)
    INSERT INTO notificaciones (user_id, tipo, reference_id, metadata)
    VALUES (
        v_target_user,
        'VERIFICATION_APPROVED',
        p_request_id,
        jsonb_build_object(
            'mensaje', '¡Felicitaciones! Tu Verificación Elite ha sido aprobada.',
            'request_id', p_request_id,
            'notes', p_notes
        )
    );

    RETURN jsonb_build_object('success', true, 'message', 'Verificación aprobada exitosamente.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_approve_verification(uuid, text) TO authenticated;


-- ─── REJECT ───────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.rpc_reject_verification(uuid, text);
CREATE OR REPLACE FUNCTION public.rpc_reject_verification(
    p_request_id       UUID,
    p_rejection_reason TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_admin_id      UUID;
    v_is_admin      BOOLEAN;
    v_target_user   UUID;
    v_amount_paid   NUMERIC;
    v_billetera_id  UUID;
BEGIN
    v_admin_id := auth.uid();

    SELECT (rol::text = 'admin') INTO v_is_admin
    FROM perfiles WHERE id = v_admin_id;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    SELECT user_id, amount_paid INTO v_target_user, v_amount_paid
    FROM verification_requests
    WHERE id = p_request_id AND status IN ('pending', 'in_review');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'REQUEST_NOT_FOUND';
    END IF;

    -- Actualizar solicitud
    UPDATE verification_requests
    SET status           = 'rejected',
        reviewed_by      = v_admin_id,
        reviewed_at      = now(),
        rejection_reason = p_rejection_reason,
        updated_at       = now()
    WHERE id = p_request_id;

    -- Reembolso: billeteras usa `id` (= user_id en auth.users)
    SELECT id INTO v_billetera_id FROM billeteras WHERE id = v_target_user;

    IF FOUND AND v_amount_paid > 0 THEN
        -- Actualizar saldo
        UPDATE billeteras
        SET saldo      = saldo + v_amount_paid,
            updated_at = now()
        WHERE id = v_billetera_id;

        -- Registrar movimiento con columnas reales:
        -- billetera_id, tipo (enum), monto, concepto, referencia (jsonb)
        INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
        VALUES (
            v_billetera_id,
            'DEPOSITO',
            v_amount_paid,
            'Reembolso por rechazo de Verificación Elite',
            jsonb_build_object('request_id', p_request_id, 'reason', p_rejection_reason)
        );
    END IF;

    -- Notificación (sin columna 'mensaje' — va en metadata)
    INSERT INTO notificaciones (user_id, tipo, reference_id, metadata)
    VALUES (
        v_target_user,
        'VERIFICATION_REJECTED',
        p_request_id,
        jsonb_build_object(
            'mensaje', 'Tu solicitud de Verificación Elite fue rechazada. Se realizó un reembolso automático.',
            'request_id', p_request_id,
            'reason', p_rejection_reason
        )
    );

    RETURN jsonb_build_object('success', true, 'message', 'Verificación rechazada y reembolso aplicado.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_reject_verification(uuid, text) TO authenticated;
