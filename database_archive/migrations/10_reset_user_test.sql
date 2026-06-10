-- 🧪 10_reset_user_test.sql
-- Borra un usuario COMPLETO para volver a probar el registro.
-- CAMBIA EL EMAIL ABAJO POR EL TUYO.

DO $$
DECLARE
    v_email text := 'danielgoleman@gmail.com'; -- 👈 PON TU EMAIL AQUÍ
    v_user_id uuid;
BEGIN
    -- 1. Buscar ID del usuario
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario no encontrado: %', v_email;
        RETURN;
    END IF;

    RAISE NOTICE 'Borrando usuario % (ID: %)...', v_email, v_user_id;

    -- 2. Limpiar tablas dependientes (Orden inverso a creación)
    -- Postulaciones (como postulante)
    DELETE FROM public.postulaciones WHERE user_id = v_user_id;
    -- Postulaciones (como empresa/vacante) - Un poco más complejo, requiere borrar vacantes primero
    
    -- Mensajes
    DELETE FROM public.mensajes WHERE sender_id = v_user_id;
    
    -- Conversaciones
    DELETE FROM public.conversaciones WHERE empresa_id = v_user_id OR postulante_id = v_user_id;

    -- Vacantes (Si es empresa)
    DELETE FROM public.vacantes WHERE empresa_id = v_user_id;

    -- Movimientos (Finanzas)
    DELETE FROM public.movimientos WHERE billetera_id = v_user_id;
    
    -- Transacciones (Legacy)
    DELETE FROM public.transacciones 
    WHERE from_wallet_id = v_user_id OR to_wallet_id = v_user_id;

    -- Billeteras
    DELETE FROM public.billeteras WHERE id = v_user_id;

    -- Empresas
    DELETE FROM public.empresas WHERE id = v_user_id;

    -- Perfiles
    DELETE FROM public.perfiles WHERE id = v_user_id;

    -- 3. Finalmente, borrar de Auth (El origen)
    DELETE FROM auth.users WHERE id = v_user_id;

    RAISE NOTICE '✅ Usuario % eliminado completamente.', v_email;
END $$;
