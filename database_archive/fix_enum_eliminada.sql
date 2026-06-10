-- 🛠️ FIX: EXTENSIÓN DE ESTADOS DE VACANTE
-- Permite que la base de datos acepte el borrado lógico 'eliminada'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'estado_vacante_enum' AND e.enumlabel = 'eliminada'
    ) THEN
        ALTER TYPE public.estado_vacante_enum ADD VALUE 'eliminada';
    END IF;
END
$$;
