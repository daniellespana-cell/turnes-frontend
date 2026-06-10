-- 🛠️ CORRECCIÓN DE SCHEMA (Tabla Movimientos)
-- El error indica que falta la columna 'estado'. Agregamos también 'referencia' por si acaso.

DO $$
BEGIN
    -- 1. Agregar columna 'estado' (Ej: completado, pendiente, fallido)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'estado') THEN
        ALTER TABLE public.movimientos ADD COLUMN estado TEXT DEFAULT 'completado';
        RAISE NOTICE '✅ Columna estado agregada.';
    END IF;

    -- 2. Agregar columna 'referencia' (ID de transacción externo/interno)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos' AND column_name = 'referencia') THEN
        ALTER TABLE public.movimientos ADD COLUMN referencia TEXT;
        RAISE NOTICE '✅ Columna referencia agregada.';
    END IF;
END $$;
