-- 🚨 100_STRESS_TEST_DOOMSDAY.sql (v2: FK Compatible)
-- PROPÓSITO: Carga Masiva RESPETANDO Foreign Keys (Auth)
-- MÉTODO: Inyecta en 'auth.users' y deja que el Trigger cree el resto.

BEGIN;

DO $$
DECLARE
    v_start_time timestamptz := clock_timestamp();
    v_empresa_id uuid;
    v_worker_id uuid;
    v_vacante_id uuid;
    i int;
    j int;
    v_total_empresas int := 50;     -- Lote seguro (Subir si eres valiente)
    v_total_workers int := 200;      -- Lote seguro
    v_vacantes_per_empresa int := 3; 
BEGIN
    RAISE NOTICE '🔥 REINICIANDO PROTOCOLO DOOMSDAY (FK SAFE)...';

    -- Pre-Check: Asegurar que la función handle_new_user esté actualizada
    -- (El usuario debería correr el script 20260213 actualizado antes de esto)

    -- =================================================================
    -- 1. GENERACIÓN DE EMPRESAS (Evil Corps)
    -- =================================================================
    RAISE NOTICE '🏭 Forjando % Evil Corps...', v_total_empresas;
    
    FOR i IN 1..v_total_empresas LOOP
        v_empresa_id := uuid_generate_v4();
        
        -- A. Insertar en AUTH.USERS (El Trigger creará Perfil + Billetera + Empresa)
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            v_empresa_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'evil_corp_' || i || '@test.com', 
            '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789', -- Dummy Hash
            now(),
            jsonb_build_object(
                'rol', 'empresa', 
                'company_name', 'Evil Corp ' || i,
                'nit', '666-666-' || i
            )
        );

        -- B. Inyectar Capital (Hackeo directo a la Billetera creada por el trigger)
        -- Pequeño delay para asegurar que el trigger corrió (en la misma tx debería ser inmediato)
        UPDATE public.billeteras SET saldo = 999999999 WHERE id = v_empresa_id;

        -- C. Crear Vacantes (Directamente al public schema)
        FOR j IN 1..v_vacantes_per_empresa LOOP
            INSERT INTO public.vacantes (empresa_id, titulo, descripcion, salario, lat, lng, status)
            VALUES (
                v_empresa_id,
                'Vacante Infernal ' || i || '-' || j,
                'Trabaja con nosotros eternamente.',
                666000 + (random() * 100000),
                4.60 + (random() * 0.1), 
                -74.08 + (random() * 0.1),
                'activa'
            );
        END LOOP;
    END LOOP;

    -- =================================================================
    -- 2. GENERACIÓN DE TRABAJADORES (Minions)
    -- =================================================================
    RAISE NOTICE '👷 Reclutando % Minions...', v_total_workers;
    
    FOR i IN 1..v_total_workers LOOP
        v_worker_id := uuid_generate_v4();
        
        -- A. Insertar Minion en Auth
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (
            v_worker_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'minion_' || i || '@test.com', 
            '$2a$10$dummyhashforminions.........................',
            now(),
            jsonb_build_object('rol', 'postulante', 'full_name', 'Minion ' || i)
        );

        -- B. LLUVIA DE POSTULACIONES
        FOR j IN 1..5 LOOP -- Cada minion aplica a 5 ofertas
            SELECT id INTO v_vacante_id FROM public.vacantes ORDER BY random() LIMIT 1;
            
            BEGIN
                INSERT INTO public.postulaciones (vacante_id, user_id, status)
                VALUES (v_vacante_id, v_worker_id, 'pendiente');
                
                -- C. SIMULAR PAGO (10% Chance)
                IF (random() < 0.1) THEN
                    UPDATE public.postulaciones 
                    SET step = 1, is_paid = true, status = 'chat_iniciado'
                    WHERE vacante_id = v_vacante_id AND user_id = v_worker_id;

                    INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto)
                    VALUES ((SELECT empresa_id FROM public.vacantes WHERE id = v_vacante_id), 'PAGO_SERVICIO', -19900, 'Fee Doomsday');
                END IF;

            EXCEPTION WHEN OTHERS THEN NULL; -- Ignorar duplicados
            END;
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ DOOMSDAY V2 COMPLETADO. Tiempo: %', clock_timestamp() - v_start_time;
END $$;

COMMIT;
