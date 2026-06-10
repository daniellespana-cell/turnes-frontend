-- ============================================================
-- TURNES: ELITE VERIFICATION SYSTEM
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. TABLA: verification_requests
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role        VARCHAR(20) NOT NULL CHECK (user_role IN ('empresa', 'postulante')),
    status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
    payment_movement_id UUID,           -- FK a movimientos (trazabilidad)
    amount_paid      NUMERIC(12,2) NOT NULL DEFAULT 20000,
    -- Documentos: array de objetos { type, storage_path, name }
    documents        JSONB        NOT NULL DEFAULT '[]',
    -- Admin
    admin_notes      TEXT,
    reviewed_by      UUID        REFERENCES auth.users(id),
    reviewed_at      TIMESTAMPTZ,
    rejection_reason TEXT,
    -- Timestamps
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_verif_requests_user     ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verif_requests_status   ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verif_requests_created  ON public.verification_requests(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. RLS — verification_requests
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Usuario: solo ve sus propias solicitudes
DROP POLICY IF EXISTS "User reads own requests" ON public.verification_requests;
CREATE POLICY "User reads own requests"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Usuario: solo puede insertar la suya (el RPC lo hace por él)
DROP POLICY IF EXISTS "User inserts own request" ON public.verification_requests;
CREATE POLICY "User inserts own request"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin: acceso total (verifica role='admin' en perfiles)
DROP POLICY IF EXISTS "Admin full access" ON public.verification_requests;
CREATE POLICY "Admin full access"
    ON public.verification_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ─────────────────────────────────────────────────────────────
-- 3. STORAGE BUCKET: verification-docs (privado)
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-docs',
    'verification-docs',
    false,
    10485760, -- 10 MB max por archivo
    ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Storage: solo el dueño puede subir a su carpeta
DROP POLICY IF EXISTS "User uploads own docs" ON storage.objects;
CREATE POLICY "User uploads own docs"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- RLS Storage: admin puede leer todos los documentos
DROP POLICY IF EXISTS "Admin reads all docs" ON storage.objects;
CREATE POLICY "Admin reads all docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-docs'
        AND EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- El usuario puede leer sus propios docs
DROP POLICY IF EXISTS "User reads own docs" ON storage.objects;
CREATE POLICY "User reads own docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ─────────────────────────────────────────────────────────────
-- 4. RPC: rpc_request_verification
-- Descuenta saldo + crea solicitud. NO otorga verificado=true.
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.rpc_request_verification(jsonb);
CREATE OR REPLACE FUNCTION public.rpc_request_verification(p_documents jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id       UUID;
    v_user_role     VARCHAR(20);
    v_saldo_actual  NUMERIC(12,2);
    v_precio        NUMERIC(12,2) := 20000;
    v_mov_id        UUID;
    v_req_id        UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Obtener rol del usuario
    SELECT rol INTO v_user_role FROM perfiles WHERE id = v_user_id;
    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'USER_NOT_FOUND';
    END IF;

    -- Verificar que no tenga una solicitud pendiente ya activa
    IF EXISTS (
        SELECT 1 FROM verification_requests
        WHERE user_id = v_user_id AND status IN ('pending', 'in_review')
    ) THEN
        RAISE EXCEPTION 'ALREADY_PENDING: Ya tienes una solicitud de verificación en proceso.';
    END IF;

    -- Verificar que no esté ya verificado
    IF EXISTS (
        SELECT 1 FROM perfiles WHERE id = v_user_id AND verificado = true
    ) THEN
        RAISE EXCEPTION 'ALREADY_VERIFIED: Tu cuenta ya está verificada.';
    END IF;

    -- Verificar saldo suficiente
    SELECT saldo INTO v_saldo_actual FROM billeteras WHERE id = v_user_id;
    IF v_saldo_actual IS NULL OR v_saldo_actual < v_precio THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Saldo insuficiente. Necesitas $20.000 COP.';
    END IF;

    -- Descontar saldo
    UPDATE billeteras
    SET saldo = saldo - v_precio, updated_at = now()
    WHERE id = v_user_id;

    -- Registrar movimiento
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, estado, metadata)
    VALUES (v_user_id, 'GASTO', v_precio, 'Verificación Elite Turnes', 'completado',
            jsonb_build_object('type', 'verification', 'status', 'pending_review'))
    RETURNING id INTO v_mov_id;

    -- Crear solicitud de verificación
    INSERT INTO verification_requests (user_id, user_role, status, payment_movement_id, amount_paid, documents)
    VALUES (v_user_id, v_user_role, 'pending', v_mov_id, v_precio, COALESCE(p_documents, '[]'))
    RETURNING id INTO v_req_id;

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_req_id,
        'status', 'pending',
        'message', 'Solicitud creada. El equipo revisará tu documentación en 24-48h.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_request_verification(jsonb) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC: rpc_approve_verification (solo admin)
-- ─────────────────────────────────────────────────────────────
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
    v_admin_id   UUID;
    v_is_admin   BOOLEAN;
    v_target_user UUID;
    v_user_role  VARCHAR(20);
BEGIN
    v_admin_id := auth.uid();

    -- Verificar que quien llama es admin
    SELECT (rol = 'admin') INTO v_is_admin FROM perfiles WHERE id = v_admin_id;
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
    SET status = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        admin_notes = p_notes,
        updated_at = now()
    WHERE id = p_request_id;

    -- Marcar usuario como verificado en perfiles
    UPDATE perfiles SET verificado = true, updated_at = now()
    WHERE id = v_target_user;

    -- Si es empresa, también marcar en tabla empresas
    IF v_user_role = 'empresa' THEN
        UPDATE empresas SET verificado = true, updated_at = now()
        WHERE user_id = v_target_user;
    END IF;

    -- Insertar notificación al usuario
    INSERT INTO notificaciones (user_id, tipo, mensaje, metadata)
    VALUES (
        v_target_user,
        'VERIFICATION_APPROVED',
        '¡Felicitaciones! Tu Verificación Elite ha sido aprobada. Tu cuenta ahora tiene el sello de confianza de Turnes.',
        jsonb_build_object('request_id', p_request_id)
    );

    RETURN jsonb_build_object('success', true, 'message', 'Verificación aprobada exitosamente.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_approve_verification(uuid, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. RPC: rpc_reject_verification (solo admin + reembolso)
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.rpc_reject_verification(uuid, text);
CREATE OR REPLACE FUNCTION public.rpc_reject_verification(
    p_request_id     UUID,
    p_rejection_reason TEXT
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
    v_amount_paid NUMERIC(12,2);
BEGIN
    v_admin_id := auth.uid();

    SELECT (rol = 'admin') INTO v_is_admin FROM perfiles WHERE id = v_admin_id;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    SELECT user_id, amount_paid INTO v_target_user, v_amount_paid
    FROM verification_requests
    WHERE id = p_request_id AND status IN ('pending', 'in_review');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'REQUEST_NOT_FOUND';
    END IF;

    -- Actualizar solicitud como rechazada
    UPDATE verification_requests
    SET status = 'rejected',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        rejection_reason = p_rejection_reason,
        updated_at = now()
    WHERE id = p_request_id;

    -- Reembolso automático al saldo de billetera
    UPDATE billeteras
    SET saldo = saldo + v_amount_paid, updated_at = now()
    WHERE id = v_target_user;

    -- Registrar reembolso en movimientos
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, estado, metadata)
    VALUES (
        v_target_user, 'INGRESO', v_amount_paid,
        'Reembolso: Verificación Elite rechazada', 'completado',
        jsonb_build_object('type', 'refund', 'request_id', p_request_id)
    );

    -- Notificación al usuario con razón del rechazo
    INSERT INTO notificaciones (user_id, tipo, mensaje, metadata)
    VALUES (
        v_target_user,
        'VERIFICATION_REJECTED',
        CONCAT('Tu solicitud de Verificación Elite fue revisada y no pudo ser aprobada. Razón: ', p_rejection_reason, '. Se ha reembolsado tu pago a la billetera.'),
        jsonb_build_object('request_id', p_request_id, 'reason', p_rejection_reason)
    );

    RETURN jsonb_build_object('success', true, 'refunded', v_amount_paid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_reject_verification(uuid, text) TO authenticated;

COMMIT;
