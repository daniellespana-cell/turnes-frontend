-- 1. � ELIMINAR FUNCIÓN INSEGURA (Si existe)
-- Usamos DROP IF EXISTS para evitar errores si ya fue borrada o nunca existió.
DROP FUNCTION IF EXISTS rpc_recargar_saldo(NUMERIC, TEXT);
DROP FUNCTION IF EXISTS rpc_recargar_saldo(INT, TEXT);

-- 2. 🧱 PREPARATIVOS (Tablas y Columnas)
-- Aseguramos que existan las dependencias antes de crear la función.

-- A. Tabla de Eventos Wompi
CREATE TABLE IF NOT EXISTS public.wompi_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    transaction_id TEXT NOT NULL UNIQUE,
    reference TEXT NOT NULL,
    amount_in_cents BIGINT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB,
    signature TEXT
);
CREATE INDEX IF NOT EXISTS idx_wompi_events_transaction_id ON public.wompi_events(transaction_id);

-- B. Columnas Faltantes en Movimientos (Metadata + Estado + Referencia)
DO $$
BEGIN
    -- Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'metadata') THEN
        ALTER TABLE public.movimientos ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
        CREATE INDEX IF NOT EXISTS idx_movimientos_metadata_gin ON public.movimientos USING GIN (metadata);
    END IF;

    -- Estado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'estado') THEN
        ALTER TABLE public.movimientos ADD COLUMN estado TEXT DEFAULT 'completado';
    END IF;

    -- Referencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'referencia') THEN
        ALTER TABLE public.movimientos ADD COLUMN referencia TEXT;
    END IF;
END $$;

-- 3. 🧠 CREAR/ACTUALIZAR FUNCIÓN WEBHOOK
CREATE OR REPLACE FUNCTION handle_wompi_webhook(event_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_type TEXT;
    v_transaction_id TEXT;
    v_status TEXT;
    v_reference TEXT;
    v_amount_in_cents BIGINT;
    v_user_id UUID;
    v_user_exists BOOLEAN;
BEGIN
    -- A. Extraer datos
    v_event_type := event_data->>'event';
    
    IF v_event_type != 'transaction.updated' THEN
        RETURN jsonb_build_object('status', 'ignored', 'message', 'Not a transaction update');
    END IF;

    v_transaction_id := event_data->'data'->'transaction'->>'id';
    v_status := event_data->'data'->'transaction'->>'status';
    v_reference := event_data->'data'->'transaction'->>'reference';
    v_amount_in_cents := (event_data->'data'->'transaction'->>'amount_in_cents')::BIGINT;

    -- B. Idempotencia
    IF EXISTS (SELECT 1 FROM public.wompi_events WHERE transaction_id = v_transaction_id) THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Already processed');
    END IF;

    -- C. Registrar evento (Log Raw)
    INSERT INTO public.wompi_events (transaction_id, reference, amount_in_cents, status, payload, signature)
    VALUES (v_transaction_id, v_reference, v_amount_in_cents, v_status, event_data, 'valid_by_edge_function');

    -- D. Solo procesar APROBADAS
    IF v_status != 'APPROVED' THEN
        RETURN jsonb_build_object('status', 'ok', 'message', 'Transaction not approved');
    END IF;

    -- E. Identificar Usuario (Por Referencia Segura)
    -- Formato esperado: REF-<UUID>-<TIMESTAMP>
    -- Split por guiones. El UUID debería ser la segunda parte (índice 2 en SQL, 1-based)
    -- Ejemplo: REF-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11-174000123456
    
    BEGIN
        -- FIX: Usamos SUBSTRING porque split_part rompe el UUID que tiene guiones internos.
        -- Formato: REF-<UUID>-<TIMESTAMP>
        -- "REF-" son 4 caracteres. El UUID empieza en el 5 y midel 36.
        v_user_id := substring(v_reference from 5 for 36)::UUID;
    EXCEPTION WHEN OTHERS THEN
        -- Si falla el casting a UUID, es un intento de fraude o formato antiguo
        INSERT INTO public.system_logs (level, component, message, metadata)
        VALUES ('ERROR', 'WOMPI_WEBHOOK', 'Referencia inválida o manipulada', jsonb_build_object('ref', v_reference));
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid Reference Format');
    END;
    
    -- F. Verificar Existencia
    SELECT EXISTS(SELECT 1 FROM public.billeteras WHERE id = v_user_id) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Crear billetera si es la primera vez (auto-provisioning)
        -- O lanzar error si prefieres strict mode. Aquí somos permisivos para UX.
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_user_id, 0, now());
    END IF;

    -- G. 💰 ACREDITAR FONDOS
    UPDATE public.billeteras
    SET saldo = saldo + (v_amount_in_cents / 100),
        updated_at = now()
    WHERE id = v_user_id;

    -- H. Historial
    INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, estado, metadata)
    VALUES (
        v_user_id, 
        'DEPOSITO', -- CORREGIDO: Usamos un valor permitido por el constraint
        (v_amount_in_cents / 100), 
        v_reference, 
        'completado', 
        jsonb_build_object('wompi_id', v_transaction_id, 'source', 'wompi_webhook')
    );

    RETURN jsonb_build_object('status', 'success', 'message', 'Funds credited to User ID');
END;
$$;

-- 3. 🛡️ PERMISOS (AL FINAL para asegurar que la función existe)
-- Revocamos acceso público y solo permitimos service_role (Edge Functions)
REVOKE EXECUTE ON FUNCTION handle_wompi_webhook(JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION handle_wompi_webhook(JSONB) TO service_role;
