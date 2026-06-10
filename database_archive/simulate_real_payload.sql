-- 🧪 SIMULACRO EXACTO (Validación Final con ID Real)
-- Usaremos el ID que falló recientemente para confirmar que ya pasaría.

DO $$
DECLARE
    -- ID del usuario que hizo el pago
    v_user_id UUID := '81fa408e-1cd4-4746-9728-6716a8f2af4c'; 
    
    v_fake_ref TEXT;
    v_payload JSONB;
    v_result JSONB;
BEGIN
    -- Usamos la referencia que vimos en tu log exitoso
    v_fake_ref := 'REF-81fa408e-1cd4-4746-9728-6716a8f2af4c-1771550765292';
    
    RAISE NOTICE 'Probando con referencia: %', v_fake_ref;

    v_payload := jsonb_build_object(
        'event', 'transaction.updated',
        'data', jsonb_build_object(
            'transaction', jsonb_build_object(
                'id', '12036401-1771550858-41073', -- ID Real
                'reference', v_fake_ref,
                'amount_in_cents', 2000000, 
                'status', 'APPROVED',
                'status_message', 'Aprobada (Simulacro Final)'
            )
        )
    );

    -- Llamada a la función (ASEGÚRATE DE HABER CORRIDO wompi_security_hardening.sql ANTES)
    -- Si la función no usa 'DEPOSITO', esto fallará.
    v_result := public.handle_wompi_webhook(v_payload);

    RAISE NOTICE 'Resultado: %', v_result;
END $$;

-- Verificación
SELECT 'Check Movimientos' as step;
SELECT * FROM movimientos WHERE metadata->>'wompi_id' = '12036401-1771550858-41073';
