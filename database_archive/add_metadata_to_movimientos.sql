-- 🚨 FIX DE COLUMNA FALTANTE: METADATA EN MOVIMIENTOS
-- El error indica que la tabla 'movimientos' no tiene la columna 'metadata'.

-- 1. Agregar columna metadata si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'movimientos'
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.movimientos ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
    END IF;
END $$;

-- 2. Crear índice para búsquedas rápidas dentro del JSON (importante para el polling)
CREATE INDEX IF NOT EXISTS idx_movimientos_metadata_gin ON public.movimientos USING GIN (metadata);

-- 3. Mensaje de confirmación
COMMENT ON COLUMN public.movimientos.metadata IS 'Datos extra del movimiento (ej: ID de Wompi, source, etc)';
