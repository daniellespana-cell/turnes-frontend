-- =========================================================================
-- VULNERABILITY FIX PHASE 2: DISK QUOTA (ANTI DB BLOAT)
-- Protege tu Base de Datos de quedarse sin espacio en disco por payloads XSS masivos.
-- =========================================================================

-- Agregamos un candado estricto: El texto del mensaje no puede exceder 5000 caracteres 
-- (Equivalente a 2 hojas enteras de Word).
-- Cualquier scraper, bot o hacker intentando enviar un payload JSON de 50 MegaBytes 
-- será bloqueado antes de que siquiera toque el disco duro físico del servidor.

DO $$
BEGIN
    -- Verifica si la regla ya existe para evitar errores en ejecuciones repetidas
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'check_tamano_mensaje' AND conrelid = 'public.mensajes'::regclass
    ) THEN
        ALTER TABLE public.mensajes
        ADD CONSTRAINT check_tamano_mensaje CHECK (length(content) <= 5000);
    END IF;
END $$;
