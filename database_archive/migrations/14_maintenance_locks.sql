-- 🚨 14_maintenance_locks.sql
-- Intenta "desbloquear" la BD matando consultas pegadas

-- 1. Matar consultas activas que lleven más de 1 minuto corriendo (potenciales deadlocks)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active' 
AND pid <> pg_backend_pid() 
AND now() - query_start > interval '1 minute';

-- 2. Matar consultas IDLE in transaction (muy común que bloqueen migraciones/triggers)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state LIKE 'idle in transaction%'
AND pid <> pg_backend_pid()
AND now() - state_change > interval '10 seconds';

-- 3. Analizar tablas clave para refrescar estadísticas (VACUUM ANALYZE)
ANALYZE VERBOSE auth.users;
ANALYZE VERBOSE public.perfiles;
-- ANALYZE VERBOSE public.carteras; -- (No existe, ignorar)
ANALYZE VERBOSE public.billeteras;

-- 4. Verificar si public.perfiles tiene índices duplicados o rotos (reindexar)
REINDEX TABLE public.perfiles;

DO $$
BEGIN
    RAISE NOTICE '✅ Mantenimiento de bloqueos ejecutado.';
END $$;
