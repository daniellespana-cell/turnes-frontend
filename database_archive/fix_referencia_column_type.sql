-- 🛠️ CORRECCIÓN TIPADO (Referencia debe ser TEXTO)
-- El error "column referencia is of type jsonb" indica que se creó con el tipo incorrecto.

DO $$
BEGIN
    -- Verificar si es JSONB y convertirlo a TEXT
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'movimientos' 
        AND column_name = 'referencia' 
        AND data_type = 'jsonb'
    ) THEN
        RAISE NOTICE '⚠️ La columna referencia es JSONB. Convirtiéndola a TEXT...';
        
        -- Convertimos la columna. Usamos 'USING' para castear datos existentes si los hay.
        ALTER TABLE public.movimientos 
        ALTER COLUMN referencia TYPE TEXT 
        USING referencia::TEXT;
        
        RAISE NOTICE '✅ Columna referencia convertida a TEXT exitosamente.';
    ELSE
        RAISE NOTICE 'ℹ️ La columna referencia ya es TEXT o no existe (se creará si falta).';
    END IF;

    -- Asegurar que exista (si no existiera)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'referencia') THEN
        ALTER TABLE public.movimientos ADD COLUMN referencia TEXT;
    END IF;
    
    -- Asegurar 'estado' también
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'estado') THEN
        ALTER TABLE public.movimientos ADD COLUMN estado TEXT DEFAULT 'completado';
    END IF;

END $$;
