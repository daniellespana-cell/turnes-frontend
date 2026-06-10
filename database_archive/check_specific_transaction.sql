-- 🕵️‍♂️ RASTREO DE TRANSACCIÓN (NUEVA)
-- ID: 12036401-1771550858-41073

SELECT '1. BÚSQUEDA EN WOMPI_EVENTS (¿Entró el Webhook?)' as checkpoint;
SELECT 
    created_at, 
    transaction_id, 
    status, 
    reference, 
    signature 
FROM wompi_events 
WHERE transaction_id = '12036401-1771550858-41073';

SELECT '--------------------------------------------------' as separator;

SELECT '2. BÚSQUEDA EN MOVIMIENTOS (¿Se procesó?)' as checkpoint;
SELECT 
    created_at, 
    monto, 
    tipo, 
    metadata 
FROM movimientos 
WHERE metadata->>'wompi_id' = '12036401-1771550858-41073';

SELECT '--------------------------------------------------' as separator;

SELECT '3. ULTIMOS ERRORES (System Logs)' as checkpoint;
-- Buscamos si el SQL reportó algun error de parsing
SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 5;
