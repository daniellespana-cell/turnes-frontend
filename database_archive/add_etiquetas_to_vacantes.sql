-- 🚀 TAXONOMY MATCH UPGRADE
-- Añade la columna 'etiquetas' a las vacantes para almacenar los hashtags (Max 2)
-- elegidos por las empresas desde el CargoTagSelector. Este arreglo permite
-- que el backend/recomendador filtre resultados en el feed de los trabajadores.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacantes' AND column_name = 'etiquetas'
    ) THEN
        ALTER TABLE public.vacantes ADD COLUMN "etiquetas" TEXT[] DEFAULT '{}';
        
        -- Opcional: Crear un índice GIN para búsquedas hiper rápidad de Arrays futuros
        CREATE INDEX IF NOT EXISTS idx_vacantes_etiquetas_gin ON public.vacantes USING GIN (etiquetas);
    END IF;
END $$;
