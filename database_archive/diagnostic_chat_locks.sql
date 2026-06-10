-- ==========================================
-- SCRIPT DE DIAGNÓSTICO: NIVEL USUARIO
-- ==========================================
-- (Sombree y ejecute cada bloque por separado)

-- 1. VERIFICAR QUE NO HAYA DESFASE DE SECUENCIAS
SELECT setval(
  pg_get_serial_sequence('mensajes', 'id'),
  (SELECT MAX(id) FROM mensajes)
)
WHERE false; -- (Esto en UUID no aplica, pero evita bloqueos de IDs incrementales si hubiera alguna columna oculta)

-- 2. REVISAR ESTADO GENERAL DE LA TABLA (Permitido para no-superusers)
SELECT 
    schemaname,
    relname AS table_name, 
    n_live_tup AS row_count, 
    n_tup_ins AS total_inserts,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables 
WHERE relname = 'mensajes';

-- 3. VALIDAR QUE EL TRIGGER DEL TIMESTAMP ESTÉ VIVO EN LA TABLA POSTULACIONES
--    (A veces, si este trigger falla del lado PostgREST, hace rollback a todo el Websocket)
SELECT routine_name
FROM information_schema.routines
WHERE routine_type='FUNCTION'
  AND specific_schema='public'
  AND routine_name LIKE '%update%';
