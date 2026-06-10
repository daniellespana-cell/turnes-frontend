-- 🕵️‍♂️ INSPECTOR DE ORIGEN
-- Vamos a ver de dónde salió esa transacción exitosa

SELECT 
    id,
    created_at,
    tipo,
    monto,
    referencia,
    metadata,
    metadata->>'source' as origen,
    metadata->>'wompi_id' as id_wompi
FROM public.movimientos
WHERE id = '013be21b-5883-479e-aa79-ccb60a8a2f64';
