-- 🏦 7_migration_refactor.sql
-- ARQUITECTURA SENIOR: Refactor de Moneda, Historia y Seguridad
-- Objetivo: Estandarización a NUMERIC(12,2), Consolidación de Movimientos y RLS.

BEGIN;

-- ==========================================
-- 1. 🔄 ACTUALIZACIÓN DE ENUMS (Segura)
-- ==========================================
DO $$ BEGIN
    ALTER TYPE estado_postulacion_enum ADD VALUE 'chat_iniciado';
EXCEPTION
    WHEN duplicate_object THEN null; -- Ya existe
END $$;


-- ==========================================
-- 2. 💰 ESTANDARIZACIÓN MONETARIA (BigInt -> Numeric)
-- Asumimos que BigInt eran "Pesos" (Unidades), no Centavos.
-- ==========================================

-- A. Billeteras
ALTER TABLE billeteras
    ALTER COLUMN saldo TYPE numeric(12, 2) USING saldo::numeric;

-- B. Planes
ALTER TABLE planes
    ALTER COLUMN costo_mensual TYPE numeric(12, 2) USING costo_mensual::numeric;

-- C. Turnos (Presupuesto)
ALTER TABLE turnos
    ALTER COLUMN presupuesto TYPE numeric(12, 2) USING presupuesto::numeric;
    
-- D. Cuentas Sistema
ALTER TABLE cuentas_sistema
    ALTER COLUMN saldo TYPE numeric(12, 2) USING saldo::numeric;


-- ==========================================
-- 3. 📜 CONSOLIDACIÓN DE HISTORIA
-- Migrar 'transacciones' (Legacy) a 'movimientos' (New Ledger)
-- ==========================================

-- A. Migrar Egresos (De Wallet X a System/Wallet Y)
INSERT INTO movimientos (id, billetera_id, tipo, monto, concepto, referencia, created_at)
SELECT 
    uuid_generate_v4(), -- Nuevo ID
    from_wallet_id,
    'RETIRO', -- O 'PAGO_SERVICIO' genérico
    -(monto::numeric), -- Negativo para egresos
    COALESCE(tipo, 'Migración Histórica'),
    jsonb_build_object('source', 'transacciones_migration', 'legacy_id', id),
    created_at
FROM transacciones
WHERE from_wallet_id IS NOT NULL;

-- B. Migrar Ingresos (A Wallet X)
INSERT INTO movimientos (id, billetera_id, tipo, monto, concepto, referencia, created_at)
SELECT 
    uuid_generate_v4(),
    to_wallet_id,
    'DEPOSITO',
    monto::numeric, -- Positivo para ingresos
    COALESCE(tipo, 'Migración Histórica'),
    jsonb_build_object('source', 'transacciones_migration', 'legacy_id', id),
    created_at
FROM transacciones
WHERE to_wallet_id IS NOT NULL;

-- C. Eliminar Tabla Legacy (Si se desea limpiar)
-- DROP TABLE transacciones CASCADE; -- ⚠️ Comentado por seguridad. Descomentar si se está seguro.


-- ==========================================
-- 4. 🛡️ SEGURIDAD & RLS (Business Layer)
-- ==========================================

-- A. Movimientos: Inmutable
-- Nadie puede borrar ni editar historial.
REVOKE UPDATE, DELETE ON movimientos FROM public, authenticated, anon;

-- B. Políticas de Lectura (Own Data)
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view own movements" ON movimientos;
    CREATE POLICY "Users view own movements" ON movimientos 
    FOR SELECT USING (auth.uid() = billetera_id);
EXCEPTION WHEN undefined_object THEN null; END $$;

-- C. Billeteras: Solo Lectura (Updates vía RPC)
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users view own wallet" ON billeteras;
    CREATE POLICY "Users view own wallet" ON billeteras 
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN undefined_object THEN null; END $$;


-- ==========================================
-- 5. 🛠️ INDEXACIÓN (Performance)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_movimientos_billetera ON movimientos(billetera_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_status ON postulaciones(status);
CREATE INDEX IF NOT EXISTS idx_postulaciones_step ON postulaciones(step);

COMMIT;
