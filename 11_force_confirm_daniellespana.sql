-- 🧪 11_force_confirm_daniellespana.sql
-- Force Confirm para el usuario 'daniellespana@gmail.com'
-- Útil si no llega el correo por límites de Supabase (3/hr).

DO $$
DECLARE
    v_email text := 'daniellespana@gmail.com';
    v_user_id uuid;
BEGIN
    -- 1. Buscar Usuario
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuario no encontrado: %. Quizás falló el registro.', v_email;
        RETURN;
    END IF;

    -- 2. Forzar Confirmación
    UPDATE auth.users 
    SET email_confirmed_at = now(),
        confirmation_token = NULL 
    WHERE id = v_user_id;

    RAISE NOTICE '✅ Usuario % confirmado manualmente (Force Confirm).', v_email;

    -- 3. Verificar Perfil
    IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_user_id) THEN
        RAISE NOTICE '⚠️ ADVERTENCIA: El usuario existe en Auth pero NO tiene Perfil. El trigger falló.';
        -- Opcional: Intentar crear perfil de emergencia aquí si se desea.
    ELSE
        RAISE NOTICE '✅ Perfil encontrado correctamente.';
    END IF;

END $$;
