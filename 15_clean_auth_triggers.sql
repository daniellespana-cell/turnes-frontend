-- 💥 15_clean_auth_triggers.sql
-- Borra TODOS los triggers personalizados en auth.users para limpiar conflictos.
-- Y reinstala limpiamente el trigger handle_new_user.

BEGIN;

-- 1. LIMPIEZA PROFUNDA
-- Borrar el trigger conocido
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Borrar otros triggers potenciales que podrían haber quedado (nombres comunes)
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_new_user ON auth.users;

-- Borrar la función para asegurar que usamos la versión nueva
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. REINSTALAR LA FUNCIÓN CANÓNICA (Versión Final)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_role text;
    v_company_name text;
BEGIN
    -- Extraer metadatos
    v_role := COALESCE(new.raw_user_meta_data->>'rol', 'postulante');
    v_company_name := new.raw_user_meta_data->>'company_name';

    -- Insertar Perfil
    INSERT INTO public.perfiles (id, rol, nombre_display, estado_cuenta)
    VALUES (
        new.id,
        v_role::rol_usuario_enum,
        COALESCE(new.raw_user_meta_data->>'full_name', v_company_name, split_part(new.email, '@', 1)),
        'activo'
    );

    -- Insertar Empresa (si aplica)
    IF v_role = 'empresa' THEN
        INSERT INTO public.empresas (id, plan_id, nombre_comercial, nit_rut)
        VALUES (
            new.id,
            (SELECT id FROM planes WHERE nombre = 'Gratuito' LIMIT 1),
            COALESCE(v_company_name, 'Empresa Sin Nombre'),
            COALESCE(new.raw_user_meta_data->>'nit', 'PENDIENTE')
        );
    END IF;

    -- Insertar Billetera
    INSERT INTO public.billeteras (id, saldo)
    VALUES (new.id, 0);

    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Fallo silencioso controlado para no tumbar auth (loguear si es posible)
        RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$;

-- 3. REINSTALAR EL TRIGGER (Solo INSERT)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Asegurar Plan Gratuito
INSERT INTO planes (nombre, costo_mensual, comision_turnos_pct, cupo_fijos_mensual)
VALUES ('Gratuito', 0, 10.0, 1) ON CONFLICT DO NOTHING;

COMMIT;

-- 5. MENSAJE FINAL
DO $$
BEGIN
    RAISE NOTICE '✅ Triggers limpiados y reinstalados correctamente.';
END $$;
