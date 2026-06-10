-- 🕵️‍♂️ SCRIPT DE DEPURACIÓN PROFUNDA (Wompi Debugger)
-- Ejecuta esto para ver DÓNDE se está perdiendo la transacción.

-- 1. ¿Llegó ALGO a la tabla de eventos crudos?
SELECT 'wompi_events' as table_name, count(*) as total_rows FROM wompi_events;

-- 2. Ver los últimos 5 eventos recibidos (si hay)
SELECT 
    created_at, 
    transaction_id, 
    status, 
    amount_in_cents, 
    reference, 
    payload->'data'->'transaction'->>'status_message' as provider_msg
FROM wompi_events 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Ver los últimos movimients (si se procesó)
SELECT 
    created_at, 
    monto, 
    tipo, 
    referencia, 
    metadata 
FROM movimientos 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Ver si hay erroes en logs del sistema (si creamos esa tabla)
-- (Si da error de que no existe, ignóralo)
SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 5;

-- 5. Chequeo de integridad de Billetera (Reemplaza con tu ID si lo sabes, o buscamos el último)
SELECT * FROM billeteras ORDER BY updated_at DESC LIMIT 1;
