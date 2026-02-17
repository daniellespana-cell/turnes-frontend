-- 🚨 99_master_reset.sql
-- WARNING: This script WIPES the 'public' schema and rebuilds it FROM SCRATCH.
-- Goal: Eliminate all "ghost" triggers, broken RLS, and schema drifts causing 500 errors.

BEGIN;

-- =================================================================
-- 1. 🔥 NUCLEAR OPTION: Drop & Recreate Schema (Clean Slate)
-- =================================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- =================================================================
-- 2. 🧩 EXTENSIONS & TYPES
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

CREATE TYPE rol_usuario_enum AS ENUM ('postulante', 'empresa', 'admin');
CREATE TYPE estado_vacante_enum AS ENUM ('activa', 'cerrada', 'expirada');
CREATE TYPE estado_postulacion_enum AS ENUM ('pendiente', 'rechazado', 'chat_iniciado', 'finalizado');
-- Note: 'finalizado' added based on rpc_finalize_contract logic.

-- =================================================================
-- 3. 🏗️ CORE TABLES (Auth & Finance)
-- =================================================================

-- A. PLANES (Para Empresas)
CREATE TABLE public.planes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre text NOT NULL UNIQUE,
    costo_mensual numeric(12, 2) NOT NULL DEFAULT 0,
    comision_turnos_pct numeric(5, 2) DEFAULT 0,
    cupo_fijos_mensual int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- B. PERFILES (Base User)
CREATE TABLE public.perfiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol rol_usuario_enum NOT NULL,
    nombre_display text,
    estado_cuenta text DEFAULT 'activo',
    avatar_url text,
    bio text,
    skills text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- C. EMPRESAS (Extension for Company Users)
CREATE TABLE public.empresas (
    id uuid PRIMARY KEY REFERENCES public.perfiles(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES public.planes(id),
    nombre_comercial text,
    nit_rut text,
    validacion_estado text DEFAULT 'pendiente',
    created_at timestamptz DEFAULT now()
);

-- D. BILLETERAS (Financial Core)
CREATE TABLE public.billeteras (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    saldo numeric(12, 2) DEFAULT 0 CHECK (saldo >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- E. MOVIMIENTOS (Ledger)
CREATE TABLE public.movimientos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    billetera_id uuid REFERENCES public.billeteras(id) ON DELETE CASCADE,
    tipo text NOT NULL CHECK (tipo IN ('DEPOSITO', 'RETIRO', 'PAGO_SERVICIO', 'COMISION')),
    monto numeric(12, 2) NOT NULL, -- Negative for debits, Positive for credits
    concepto text,
    referencia jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- =================================================================
-- 4. 🚀 APP TABLES (Vacantes & Postulaciones)
-- =================================================================

CREATE TABLE public.vacantes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    salario numeric(12, 2),
    ubicacion text,
    lat double precision,
    lng double precision,
    status estado_vacante_enum DEFAULT 'activa',
    closed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.postulaciones (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacante_id uuid REFERENCES public.vacantes(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status estado_postulacion_enum DEFAULT 'pendiente',
    step int DEFAULT 0, -- Protocolo Step
    is_paid boolean DEFAULT false,
    protocol_state jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(vacante_id, user_id)
);

-- Add Indexes
CREATE INDEX idx_vacantes_empresa ON vacantes(empresa_id);
CREATE INDEX idx_postulaciones_vacante ON postulaciones(vacante_id);
CREATE INDEX idx_postulaciones_user ON postulaciones(user_id);
CREATE INDEX idx_movimientos_billetera ON movimientos(billetera_id);


-- =================================================================
-- 5. 🛡️ HANDLE NEW USER (Trigger Logic)
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_role text;
    v_company_name text;
BEGIN
    -- Extract Metadata
    v_role := COALESCE(new.raw_user_meta_data->>'rol', 'postulante');
    v_company_name := new.raw_user_meta_data->>'company_name';

    -- 1. Perfil
    INSERT INTO public.perfiles (id, rol, nombre_display, estado_cuenta)
    VALUES (
        new.id,
        v_role::rol_usuario_enum,
        COALESCE(new.raw_user_meta_data->>'full_name', v_company_name, split_part(new.email, '@', 1)),
        'activo'
    );

    -- 2. Empresa (Conditional)
    IF v_role = 'empresa' THEN
        INSERT INTO public.empresas (id, plan_id, nombre_comercial, nit_rut)
        VALUES (
            new.id,
            (SELECT id FROM planes WHERE nombre = 'Gratuito' LIMIT 1),
            COALESCE(v_company_name, 'Empresa Sin Nombre'),
            COALESCE(new.raw_user_meta_data->>'nit', 'PENDIENTE')
        );
    END IF;

    -- 3. Billetera
    INSERT INTO public.billeteras (id, saldo)
    VALUES (new.id, 0);

    RETURN new;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$;

-- CLEAN & REBIND TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- 6. 💰 FINANCIAL RPCs (Protocol Logic)
-- =================================================================

-- Step 1 payment logic
CREATE OR REPLACE FUNCTION rpc_process_protocol_step1(
    p_application_id uuid,
    p_amount numeric,
    p_concept text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_current_balance numeric;
    v_new_balance numeric;
    v_tx_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Check Authorization
    PERFORM 1 FROM postulaciones p JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHORIZED_APPLICATION'; END IF;
    
    -- Check Idempotency
    IF EXISTS (SELECT 1 FROM postulaciones WHERE id = p_application_id AND is_paid = true) THEN
       RAISE EXCEPTION 'ALREADY_PAID'; 
    END IF;

    -- Transaction
    SELECT saldo INTO v_current_balance FROM billeteras WHERE id = v_user_id FOR UPDATE;
    
    IF v_current_balance < p_amount THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;

    v_new_balance := v_current_balance - p_amount;
    UPDATE billeteras SET saldo = v_new_balance, updated_at = now() WHERE id = v_user_id;

    INSERT INTO movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (v_user_id, 'PAGO_SERVICIO', -p_amount, p_concept, jsonb_build_object('application_id', p_application_id))
    RETURNING id INTO v_tx_id;

    UPDATE postulaciones
    SET step = 1, is_paid = true, protocol_state = protocol_state || jsonb_build_object('step1_paid_at', now(), 'tx_id', v_tx_id), updated_at = now()
    WHERE id = p_application_id;
    
    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'tx_id', v_tx_id);
END;
$$;


-- =================================================================
-- 7. 🔐 RLS POLICIES (Basic Security)
-- =================================================================

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

-- Perfiles (Public Read, Self Edit)
CREATE POLICY "Public Read Profiles" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Self Update Profile" ON perfiles FOR UPDATE USING (auth.uid() = id);

-- Empresas (Public Read)
CREATE POLICY "Public Read Companies" ON empresas FOR SELECT USING (true);

-- Billeteras (Private)
CREATE POLICY "Own Wallet" ON billeteras FOR SELECT USING (auth.uid() = id);

-- Movimientos (Private)
CREATE POLICY "Own Movements" ON movimientos FOR SELECT USING (auth.uid() = billetera_id);

-- Vacantes (Public Read, Owner Edit)
CREATE POLICY "Public Read Vacancies" ON vacantes FOR SELECT USING (true);
CREATE POLICY "Owner Edit Vacancies" ON vacantes FOR ALL USING (auth.uid() = empresa_id);

-- Postulaciones (Complex)
CREATE POLICY "Applicant Own" ON postulaciones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Company View Applications" ON postulaciones FOR SELECT USING (
    EXISTS (SELECT 1 FROM vacantes WHERE vacantes.id = postulaciones.vacante_id AND vacantes.empresa_id = auth.uid())
);


-- =================================================================
-- 8. 🌱 SEED DATA
-- =================================================================

INSERT INTO planes (nombre, costo_mensual, comision_turnos_pct, cupo_fijos_mensual)
VALUES 
    ('Gratuito', 0, 10.0, 1),
    ('Pro', 29.99, 5.0, 10)
ON CONFLICT (nombre) DO NOTHING;

COMMIT;

-- Final Notice
DO $$
BEGIN
    RAISE NOTICE '✅ 99_MASTER_RESET Executed Successfully. Public Schema Rebuilt.';
END $$;
