-- 🕵️ DIAGNÓSTICO FORENSE DE TRANSACCIÓN
-- Ejecuta esto para ver el estado real en la base de datos.

SELECT 
    e.transaction_id,
    e.status as event_status,
    e.reference,
    m.id as movimiento_id,
    m.billetera_id as owner_id,
    m.monto,
    m.metadata->>'wompi_id' as mapped_wompi_id,
    (SELECT auth.uid()) as current_session_id -- Para ver si coincide con el dueño
FROM public.wompi_events e
LEFT JOIN public.movimientos m ON m.referencia = e.transaction_id
WHERE e.transaction_id = '12036401-1778802762-92950';

-- 📝 También revisamos los logs del sistema por si hubo errores de parsing
SELECT * FROM public.system_logs 
WHERE component IN ('FINANCE_PROCESSOR', 'WOMPI_WEBHOOK')
ORDER BY created_at DESC 
LIMIT 10;
