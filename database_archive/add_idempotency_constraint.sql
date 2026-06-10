-- 🛡️ GUARDIÁN DE IDEMPOTENCIA (Nivel Senior)
-- Objetivo: Evitar duplicidad de saldos a nivel de Motor de Base de Datos.
-- Si el código falla, la base de datos protege el dinero.

-- 1. Crear índice único sobre el ID de Wompi dentro del JSONB metadata
-- Esto impide físicamente que existan dos filas con el mismo 'wompi_id'
CREATE UNIQUE INDEX IF NOT EXISTS idx_movimientos_wompi_id_unique 
ON public.movimientos ((metadata->>'wompi_id'))
WHERE metadata->>'wompi_id' IS NOT NULL; -- Solo aplica si tiene ID de Wompi

COMMENT ON INDEX public.idx_movimientos_wompi_id_unique IS 'Garantiza que una transacción de Wompi no se procese dos veces';

-- 2. Verificación (Opcional, para logs)
DO $$
BEGIN
    RAISE NOTICE '✅ Guardián de Idempotencia Activado: idx_movimientos_wompi_id_unique';
END $$;
