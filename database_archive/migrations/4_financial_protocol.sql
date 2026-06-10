-- 💰 4_financial_protocol.sql
-- IMPLEMENTACIÓN DEL PROTOCOLO FINANCIERO SEGURO (TURNES v2.6)
-- Incluye: Tablas Financieras, Auditoría, Transacciones Atómicas y Lógica de Negocio en DB.

BEGIN;

-- 1. TABLAS FINANCIERAS (Si no existen)
CREATE TABLE IF NOT EXISTS billeteras (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    saldo numeric(12, 2) DEFAULT 0 CHECK (saldo >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimientos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    billetera_id uuid REFERENCES billeteras(id) ON DELETE CASCADE,
    tipo text NOT NULL CHECK (tipo IN ('DEPOSITO', 'RETIRO', 'PAGO_SERVICIO', 'COMISION')),
    monto numeric(12, 2) NOT NULL,
    concepto text,
    referencia jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 2. MODIFICACIONES AL PROTOCOLO (Postulaciones)
ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS step int DEFAULT 0;
ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS protocol_state jsonb DEFAULT '{}';
ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;

-- 3. RPC: PASO 1 - PAGO ATÓMICO (Blindado)
CREATE OR REPLACE FUNCTION rpc_process_protocol_step1(
    p_application_id uuid,
    p_amount numeric,
    p_concept text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;          -- ✅ FIX: Variable para ID de transacción
BEGIN
    v_user_id := auth.uid();
    
    -- A. 🛡️ SEGURIDAD: Verificar Propiedad (Authorization)
    -- Solo la empresa dueña de la vacante puede pagar por esta postulación.
    PERFORM 1
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id
    AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN
       RAISE EXCEPTION 'UNAUTHORIZED_APPLICATION: No tienes permiso para operar esta postulación.';
    END IF;

    -- B. 🛡️ IDEMPOTENCIA: Verificar Estado Anterior
    -- Evitar doble cobro si el usuario da doble click o hay lag.
    IF EXISTS (
       SELECT 1 FROM postulaciones
       WHERE id = p_application_id
       AND is_paid = true
    ) THEN
       RAISE EXCEPTION 'ALREADY_PAID: Esta postulación ya fue pagada.';
    END IF;

    -- C. 🔒 LOCK: Bloquear Billetera
    SELECT saldo INTO v_current_balance
    FROM billeteras
    WHERE id = v_user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'WALLET_NOT_FOUND';
    END IF;

    -- D. Validar Fondos
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Saldo % insuficiente para pago de %', v_current_balance, p_amount;
    END IF;

    -- E. Ejecutar Descuento
    v_new_balance := v_current_balance - p_amount;
    
    UPDATE billeteras
    SET saldo = v_new_balance, updated_at = now()
    WHERE id = v_user_id;

    -- F. Registrar Movimiento (Con RETURNING ID)
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (
        v_user_id,
        'PAGO_SERVICIO',
        -p_amount,
        p_concept,
        jsonb_build_object('application_id', p_application_id, 'timestamp', now())
    )
    RETURNING id INTO v_tx_id; -- ✅ FIX: Obtenemos UUID real

    -- G. Actualizar Postulación
    UPDATE postulaciones
    SET 
        step = 1,
        is_paid = true,
        protocol_state = protocol_state || jsonb_build_object(
            'step1_paid_at', now(),
            'amount', p_amount,
            'tx_id', v_tx_id -- ✅ FIX: Usamos el UUID real
        ),
        updated_at = now()
    WHERE id = p_application_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'tx_id', v_tx_id
    );
END;
$$;

-- 4. RPC: PASO 3 - CONFIRMAR ACUERDO (Server-Side Logic)
CREATE OR REPLACE FUNCTION rpc_confirm_agreement(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();

    -- Validar propiedad
    PERFORM 1 FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

    -- Validar Prerrequisitos (Step 1 Completo)
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND is_paid = true) THEN
        RAISE EXCEPTION 'PAYMENT_REQUIRED: Debes pagar antes de confirmar.';
    END IF;

    UPDATE postulaciones
    SET 
        step = 3,
        status = 'chat_iniciado', -- O el estado de negocio que corresponda
        protocol_state = protocol_state || jsonb_build_object('step3_confirmed_at', now()),
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 5. RPC: PASO 4 - FINALIZAR (Server-Side Logic)
CREATE OR REPLACE FUNCTION rpc_finalize_contract(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();

    PERFORM 1 FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

    -- Validar Prerrequisitos (Step 3 Completo)
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND step >= 3) THEN
        RAISE EXCEPTION 'AGREEMENT_REQUIRED: Debes tener un acuerdo antes de finalizar.';
    END IF;

    UPDATE postulaciones
    SET 
        step = 4,
        status = 'finalizado', -- Ciclo cerrado
        protocol_state = protocol_state || jsonb_build_object('step4_finalized_at', now()),
        updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. POLÍTICAS RLS (Seguridad Base)
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users view own wallet" ON billeteras FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users view own movements" ON movimientos FOR SELECT USING (auth.uid() = billetera_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

COMMIT;
