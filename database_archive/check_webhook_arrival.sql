-- 🕵️‍♂️ VERIFICACIÓN DE LLEGADA DEL WEBHOOK
-- Ejecuta esto para saber si Wompi le "habló" a tu Base de Datos.

-- 1. ¿Llegó el evento?
SELECT 
    transaction_id, 
    status, 
    amount_in_cents, 
    created_at,
    reference
FROM wompi_events 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. ¿Se sumó el saldo?
-- Reemplaza este ID con el tuyo si es diferente, pero saqué este de tus logs.
SELECT * FROM billeteras 
WHERE id = '81fa408e-1cd4-4746-9728-6716a8f2af4c';

-- 3. ¿Quedó en el historial?
SELECT * FROM movimientos 
ORDER BY created_at DESC 
LIMIT 5;
