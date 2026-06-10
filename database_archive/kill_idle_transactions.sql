-- ==============================================================================
-- 🚑 SCRIPT MÉDICO: MATAR TRANSACCIONES COLGADAS (DEADLOCKS)
-- ==============================================================================
-- Si el Editor SQL anterior falló o la red se cayó a medio camino de un "BEGIN;", 
-- Postgres deja bloqueadas las tablas implicadas. 
-- Ejecuta esto para forzar la liberación de todas las llaves y limpiar el sistema.

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state IN ('idle in transaction', 'active')
  AND pid <> pg_backend_pid()
  AND usename = current_user
  AND query NOT ILIKE '%pg_terminate_backend%';
  
-- Verifica cuántos procesos se eliminaron (Si había bloqueos, esto los extermina).
