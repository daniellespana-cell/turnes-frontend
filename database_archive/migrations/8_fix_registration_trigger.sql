-- 🚑 8_fix_registration_trigger.sql
-- REPARACIÓN CRÍTICA DEL FLUJO DE REGISTRO
-- Problema: El trigger handle_new_user falla o no existe, causando logins fallidos tras registro.
-- Solución: Recrear el trigger con compatibilidad NUMERIC y manejo robusto de metadata.

BEGIN;

-- 1. Eliminar Trigger/Función anterior para asegurar limpieza
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear Función handle_new_user (Versión 2.6 Compatible)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public -- 🔒 Seguridad
AS $$
DECLARE
    v_role text;
    v_company_name text;
BEGIN
    -- Extraer metadatos (con fallbacks seguros)
    v_role := COALESCE(new.raw_user_meta_data->>'rol', 'postulante');
    v_company_name := new.raw_user_meta_data->>'company_name';

    -- 1. Insertar en PERFILES (Tabla Base)
    INSERT INTO public.perfiles (id, rol, nombre_display, estado_cuenta)
    VALUES (
        new.id,
        v_role::rol_usuario_enum, -- Casteo seguro al enum
        COALESCE(new.raw_user_meta_data->>'full_name', v_company_name, split_part(new.email, '@', 1)),
        'activo'
    );

    -- 2. Si es EMPRESA, insertar en tabla auxiliar
    IF v_role = 'empresa' THEN
        INSERT INTO public.empresas (id, plan_id, nombre_comercial, nit_rut)
        VALUES (
            new.id,
            (SELECT id FROM planes WHERE nombre = 'Gratuito' LIMIT 1), -- Plan por defecto
            COALESCE(v_company_name, 'Empresa Sin Nombre'),
            COALESCE(new.raw_user_meta_data->>'nit', 'PENDIENTE-' || substring(new.id::text, 1, 8))
        );
    END IF;

    -- 3. Crear BILLETERA (Inicialización)
    -- ✅ FIX: Usamos 0 explícito (compatible con NUMERIC)
    INSERT INTO public.billeteras (id, saldo)
    VALUES (new.id, 0);

    -- 4. Auto-Confirmar Email (DESACTIVADO para Producción/Test Real)
    -- UPDATE auth.users SET email_confirmed_at = now() WHERE id = new.id;
    
    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Loguear error (visible en debug_logs si está activo)
        -- INSERT INTO debug_logs (event_message, metadata) VALUES ('Register Error', jsonb_build_object('error', SQLERRM, 'user', new.id));
        RAISE EXCEPTION 'Registration Failed: %', SQLERRM;
END;
$$;

-- 3. Recrear el Trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Asegurar Plan Gratuito (Dependencia)
INSERT INTO planes (nombre, costo_mensual, comision_turnos_pct, cupo_fijos_mensual)
VALUES ('Gratuito', 0, 10.0, 1)
ON CONFLICT (nombre) DO NOTHING;

COMMIT;
