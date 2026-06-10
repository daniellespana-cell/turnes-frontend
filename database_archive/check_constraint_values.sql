-- 🕵️‍♂️ INSPECTOR DE CONSTRAINTS
-- Vamos a ver qué valores permite la columna 'tipo'

SELECT conname as constraint_name, pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.movimientos'::regclass
AND conname = 'movimientos_tipo_check';

-- También veamos qué valores hay actualmente en la tabla (si hay alguno)
SELECT DISTINCT tipo FROM public.movimientos;
