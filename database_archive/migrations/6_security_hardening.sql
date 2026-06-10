-- 🛡️ 6_security_hardening.sql
-- SCRIPT DE SEGURIDAD CRÍTICA (Supabase Advisor Fixes)
-- Corrige vulnerabilidades detectadas: RLS desactivado y Search Path mutable.

BEGIN;

-- 1. DESACTIVAR RLS EN TABLAS SENSIBLES (Activar Row Level Security)
-- Por defecto, Enabling RLS deniega todo acceso si no hay políticas. Esto es seguro.

ALTER TABLE IF EXISTS public.cuentas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.debug_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.debug_roles ENABLE ROW LEVEL SECURITY;
-- spatial_ref_sys es de PostGIS, a veces requiere permisos especiales,
-- pero es buena práctica activarlo si el Advisor lo pide.
-- ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY; -- ⚠️ Requires Superuser

-- 2. POLÍTICAS DE ACCESO MÍNIMAS (Solo para Admin/Service Role)
-- Para debug_logs, permitimos que el sistema inserte, pero nadie lea públicamente.
DO $$ BEGIN
    CREATE POLICY "System insert debug_logs" ON public.debug_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
-- Nadie lee debug_logs vía API (Solo Dashboard).

-- 3. HARDENING DE FUNCIONES (Fix: Function Search Path Mutable)
-- Un atacante podría crear un objeto malicioso en un esquema prioritario e interceptar llamadas.
-- Solución: Forzar `SET search_path = public`.

CREATE OR REPLACE FUNCTION rpc_process_protocol_step1(
    p_application_id uuid,
    p_amount numeric,
    p_concept text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- 🔒 FIX DE SEGURIDAD
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- (Lógica Idéntica, solo aplicamos el parche de seguridad)
    PERFORM 1
    FROM postulaciones p
    JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id
    AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN
       RAISE EXCEPTION 'UNAUTHORIZED_APPLICATION';
    END IF;

    IF EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND is_paid = true) THEN
       RAISE EXCEPTION 'ALREADY_PAID';
    END IF;

    SELECT saldo INTO v_current_balance FROM billeteras WHERE id = v_user_id FOR UPDATE;
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    v_new_balance := v_current_balance - p_amount;
    
    UPDATE billeteras SET saldo = v_new_balance, updated_at = now() WHERE id = v_user_id;

    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (v_user_id, 'PAGO_SERVICIO', -p_amount, p_concept, jsonb_build_object('application_id', p_application_id, 'timestamp', now()))
    RETURNING id INTO v_tx_id;

    UPDATE postulaciones
    SET step = 1, is_paid = true, protocol_state = protocol_state || jsonb_build_object('step1_paid_at', now(), 'amount', p_amount, 'tx_id', v_tx_id), updated_at = now()
    WHERE id = p_application_id;
    
    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'tx_id', v_tx_id);
END;
$$;

-- PATCH Step 3
CREATE OR REPLACE FUNCTION rpc_confirm_agreement(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- 🔒 FIX
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    PERFORM 1 FROM postulaciones p JOIN vacantes v ON v.id = p.vacante_id WHERE p.id = p_application_id AND v.empresa_id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND is_paid = true) THEN RAISE EXCEPTION 'PAYMENT_REQUIRED'; END IF;
    
    UPDATE postulaciones 
    SET step = 3, status = 'chat_iniciado', protocol_state = protocol_state || jsonb_build_object('step3_confirmed_at', now()), updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- PATCH Step 4
CREATE OR REPLACE FUNCTION rpc_finalize_contract(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- 🔒 FIX
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    PERFORM 1 FROM postulaciones p JOIN vacantes v ON v.id = p.vacante_id WHERE p.id = p_application_id AND v.empresa_id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
    IF NOT EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND step >= 3) THEN RAISE EXCEPTION 'AGREEMENT_REQUIRED'; END IF;

    UPDATE postulaciones 
    SET step = 4, status = 'finalizado', protocol_state = protocol_state || jsonb_build_object('step4_finalized_at', now()), updated_at = now()
    WHERE id = p_application_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- PATCH Recarga
CREATE OR REPLACE FUNCTION rpc_recargar_saldo(monto_recarga numeric, referencia_pago text)
RETURNS table (nuevo_saldo numeric, tx_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- 🔒 FIX
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF monto_recarga < 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
    
    INSERT INTO billeteras (id, saldo) VALUES (v_user_id, 0) ON CONFLICT (id) DO NOTHING;
    SELECT saldo INTO v_current_balance FROM billeteras WHERE id = v_user_id FOR UPDATE;
    
    v_new_balance := v_current_balance + monto_recarga;
    UPDATE billeteras SET saldo = v_new_balance, updated_at = now() WHERE id = v_user_id;
    
    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (v_user_id, 'DEPOSITO', monto_recarga, 'Recarga de Saldo (Manual/Test)', jsonb_build_object('ref', referencia_pago, 'timestamp', now()))
    RETURNING id INTO v_tx_id;

    RETURN QUERY SELECT v_new_balance, v_tx_id;
END;
$$;

COMMIT;
