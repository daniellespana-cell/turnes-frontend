-- fix_movimientos_tipo_constraint.sql
-- 🛠️ CORRECCIÓN: Permitir el tipo 'INGRESO' en la tabla movimientos.
-- Sin esto, rpc_rate_and_seal_v3 falla al intentar acreditar el pago al trabajador.

BEGIN;

-- 1. Intentar identificar y borrar la restricción anterior por nombre estándar
-- Si falla por nombre, se puede hacer via información de esquema, pero usualmente 
-- es 'movimientos_tipo_check'.
ALTER TABLE public.movimientos 
DROP CONSTRAINT IF EXISTS movimientos_tipo_check;

-- 2. Aplicar la nueva restricción con los tipos originales + 'INGRESO'
ALTER TABLE public.movimientos
ADD CONSTRAINT movimientos_tipo_check 
CHECK (tipo IN ('DEPOSITO', 'RETIRO', 'PAGO_SERVICIO', 'COMISION', 'INGRESO'));

COMMIT;

-- Verificación
-- SELECT * FROM pg_constraint WHERE conname = 'movimientos_tipo_check';
