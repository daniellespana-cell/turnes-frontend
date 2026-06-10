-- 🧪 SIMULACRO DE WEBHOOK (Bypass de Red)
-- Este script simula EXACTAMENTE lo que haría la Edge Function.
-- Si esto funciona, tu Base de Datos está perfecta y el problema es la conexión con Wompi (URL o Secretos).

DO $$
DECLARE
    -- 1. CAMBIA ESTO POR TU ID DE USUARIO REAL (El que tiene saldo 0)
    v_user_id UUID := '371e7b71-df2d-4ef5-b2dc-486b311267e0'; 
    
    v_fake_ref TEXT;
    v_payload JSONB;
    v_result JSONB;
BEGIN
    -- Generamos una referencia única para este test
    v_fake_ref := 'REF-' || v_user_id || '-' || (extract(epoch from now())::bigint);
    
    -- Construimos el JSON idéntico al que manda Wompi
    v_payload := jsonb_build_object(
        'event', 'transaction.updated',
        'data', jsonb_build_object(
            'transaction', jsonb_build_object(
                'id', 'SIMULATED-' || (extract(epoch from now())::bigint), -- ID único falso
                'reference', v_fake_ref,
                'amount_in_cents', 5000000, -- $50.000 COP
                'status', 'APPROVED',
                'status_message', 'Aprobada (Simulacro SQL)'
            )
        )
    );

    -- 2. Llamamos a la función MAESTRA
    v_result := public.handle_wompi_webhook(v_payload);

    -- 3. Mostramos resultados
    RAISE NOTICE 'Resultado del Simulacro: %', v_result;
END $$;

-- 4. Verificación final: ¿Subió el saldo?
SELECT * FROM billeteras WHERE id = '371e7b71-df2d-4ef5-b2dc-486b311267e0';
SELECT * FROM movimientos WHERE billetera_id = '371e7b71-df2d-4ef5-b2dc-486b311267e0' ORDER BY created_at DESC LIMIT 1;
