-- 🚨 101_CLEAN_STRESS_TEST.sql
-- PROPÓSITO: Limpiar la basura generada por el Stress Test (Doomsday).
-- ACCIÓN: Elimina usuarios de prueba de `auth.users` (Cascade eliminará perfiles, vacantes, etc.)

BEGIN;

DO $$
DECLARE
    v_count int;
BEGIN
    RAISE NOTICE '🧹 INICIANDO PROTOCOLO DE LIMPIEZA...';
    
    -- Contar víctimas
    SELECT count(*) INTO v_count FROM auth.users WHERE email LIKE '%@test.com';
    RAISE NOTICE '📉 Se eliminarán % usuarios de prueba (Minions & Evil Corps).', v_count;

    -- ELIMINACIÓN MASIVA (Cascade se encarga del resto)
    DELETE FROM auth.users 
    WHERE email LIKE '%@test.com';

    RAISE NOTICE '✅ Limpieza completada. La base de datos ha recuperado la cordura.';
END $$;

COMMIT;
