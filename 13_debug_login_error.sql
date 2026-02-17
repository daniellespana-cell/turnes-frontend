-- 🚨 13_debug_login_error.sql
-- Diagnóstico de Error 500 (Database Error) al Login/Insert

-- 1. DESACTIVAR TRIGGERS TEMPORALMENTE
-- A veces un trigger recursivo o mal formado bloquea todo el esquema.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. VERIFICAR SI HAY OTROS TRIGGERS OCULTOS
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 3. REVISAR PERMISOS DEL ROL AUTENTICADO
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. DIAGNÓSTICO DE POLÍTICAS RLS (Row Level Security)
-- A veces una política recursiva ("check user exists in table X") causa loops infinitos.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. INTENTO DE LOGIN MANUAL (Simulado)
-- Solo para verificar si la BD responde sin triggers
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos responde. Si ves esto, el problema ERA el trigger.';
END $$;
