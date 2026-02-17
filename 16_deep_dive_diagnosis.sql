-- 🕵️‍♂️ 16_deep_dive_diagnosis.sql
-- Script de Diagnóstico Profundo para Errors 500 / Database Error

-- 1. VERIFICAR PERMISOS DEL ROL 'authenticated'
-- Si este rol no tiene permiso USAGE en public, falla todo el login.
SELECT 
    grantee, table_schema, privilege_type 
FROM information_schema.schema_privileges 
WHERE grantee = 'authenticated';

-- 2. LISTAR TODAS LAS POLÍTICAS RLS (Para detectar bucles)
-- Busca si una política llama a una tabla que a su vez llama a la primera.
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. VERIFICAR TRIGGERS EN AUTH.USERS (De nuevo, por seguridad)
SELECT 
    trigger_schema, 
    trigger_name, 
    event_manipulation, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 4. VERIFICAR "DEAD TUPLES" (Tablas corruptas/llenas)
SELECT 
    schemaname, 
    relname, 
    n_live_tup, 
    n_dead_tup, 
    last_vacuum, 
    last_autovacuum 
FROM pg_stat_user_tables 
WHERE relname IN ('perfiles', 'empresas', 'billeteras');

-- 5. INTENTO DE DESACTIVAR RLS TEMPORALMENTE (Prueba de Fuego)
-- Si ejecutas esto y el login funciona, confirmamos 100% que es una Policy RLS.
-- ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.billeteras DISABLE ROW LEVEL SECURITY;
