-- 🕵️‍♂️ 12_debug_missing_profile.sql
-- Diagnóstico y Reparación para "daniellespana@gmail.com"

DO $$
DECLARE
    v_email text := 'daniellespana@gmail.com';
    v_user_id uuid;
    v_has_profile boolean;
    v_plan_id uuid;
    v_meta jsonb;
BEGIN
    RAISE NOTICE '--- INICIANDO DIAGNÓSTICO PARA % ---', v_email;

    -- 1. Verificar si existe en Auth
    SELECT id, raw_user_meta_data INTO v_user_id, v_meta 
    FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ EL USUARIO NO EXISTE EN AUTH.USERS.';
        RAISE NOTICE '   -> El registro falló antes de llegar a la base de datos o se borró.';
        RETURN;
    ELSE
        RAISE NOTICE '✅ Usuario encontrado en Auth ID: %', v_user_id;
        RAISE NOTICE '   -> Metadata: %', v_meta;
    END IF;

    -- 2. Verificar si existe en Perfiles
    SELECT EXISTS(SELECT 1 FROM public.perfiles WHERE id = v_user_id) INTO v_has_profile;

    IF v_has_profile THEN
        RAISE NOTICE '✅ El usuario YA tiene perfil en public.perfiles.';
    ELSE
        RAISE NOTICE '❌ ALERTA: El usuario existe en Auth pero NO en public.perfiles.';
        RAISE NOTICE '   -> El Trigger de registro falló silenciosamente.';
        
        -- INTENTO DE REPARACIÓN MANUAL
        RAISE NOTICE '🔧 Intentando reparar (Crear Perfil y Empresa)...';
        
        -- A. Crear Perfil
        INSERT INTO public.perfiles (id, rol, nombre_display, estado_cuenta)
        VALUES (v_user_id, 'empresa', 'Daniel España', 'activo');
        
        -- B. Verificar Plan Gratuito
        SELECT id INTO v_plan_id FROM planes WHERE nombre = 'Gratuito' LIMIT 1;
        
        IF v_plan_id IS NULL THEN
            RAISE NOTICE '⚠️ No se encontró plan "Gratuito". Creándolo...';
            INSERT INTO planes (nombre, costo_mensual, comision_turnos_pct, cupo_fijos_mensual)
            VALUES ('Gratuito', 0, 10.0, 1)
            RETURNING id INTO v_plan_id;
        END IF;

        -- C. Crear Empresa
        BEGIN
            INSERT INTO public.empresas (id, plan_id, nombre_comercial, nit_rut)
            VALUES (v_user_id, v_plan_id, 'Daniel España', 'PENDIENTE');
            RAISE NOTICE '✅ Empresa creada exitosamente.';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Error creando Empresa: %', SQLERRM;
        END;

        -- D. Crear Billetera
        INSERT INTO public.billeteras (id, saldo) VALUES (v_user_id, 0)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✨ REPARACIÓN COMPLETADA. Intenta buscarlo ahora en la tabla.';
    END IF;

END $$;
