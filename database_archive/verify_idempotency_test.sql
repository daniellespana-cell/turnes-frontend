-- 🧪 SCRIPT DE PRUEBA: VERIFICACIÓN DE IDEMPOTENCIA (CORREGIDO)
-- Objetivo: Demonstrar que la base de datos RECHAZA transacciones duplicadas de Wompi.
-- Instrucciones: Ejecuta este script. Debería mostrar un mensaje de EXITO confirmando el bloqueo.

DO $$
DECLARE
    v_billetera_id UUID;
    v_wompi_id_test TEXT := 'TEST-WOMPI-IDEMPOTENCY-' || floor(random() * 100000)::text;
BEGIN
    -- 1. Obtener una BILLETERA válida (para evitar error de Foreign Key)
    SELECT id INTO v_billetera_id FROM public.billeteras LIMIT 1;
    
    IF v_billetera_id IS NULL THEN
        RAISE NOTICE '⚠️ No hay billeteras creadas. Creando una temporal...';
        -- Fallback: Si no hay billeteras, tomamos un usuario y le creamos una
        SELECT id INTO v_billetera_id FROM auth.users LIMIT 1;
        INSERT INTO public.billeteras (id, saldo) VALUES (v_billetera_id, 0) ON CONFLICT DO NOTHING;
    END IF;

    -- 2. PRIMERA INSERCIÓN (Debe funcionar)
    RAISE NOTICE '1️⃣ Intentando insertar transacción original (%s)...', v_wompi_id_test;
    
    INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, metadata, concepto, estado)
    VALUES (
        v_billetera_id, 
        'DEPOSITO', 
        1000, 
        'REF-TEST-1', 
        jsonb_build_object('wompi_id', v_wompi_id_test),
        'Prueba Idempotencia - Original',
        'completado'
    );
    
    RAISE NOTICE '✅ Primera inserción EXITOSA.';

    -- 3. SEGUNDA INSERCIÓN (Debe FALLAR violando el constraint)
    RAISE NOTICE '2️⃣ Intentando insertar DUPLICADO (%s)...', v_wompi_id_test;
    
    BEGIN
        INSERT INTO public.movimientos (billetera_id, tipo, monto, referencia, metadata, concepto, estado)
        VALUES (
            v_billetera_id, 
            'DEPOSITO', 
            1000, 
            'REF-TEST-2', -- Incluso con diferente referencia interna
            jsonb_build_object('wompi_id', v_wompi_id_test), -- EL MISMO ID DE WOMPI
            'Prueba Idempotencia - Duplicado Intencional',
            'completado'
        );
        
        -- Si llega aquí, el test FALLÓ porque permitió el duplicado
        RAISE EXCEPTION '❌ ERROR CRÍTICO: La base de datos PERMITIÓ una transacción duplicada. El constraint no está funcionando.';
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE NOTICE '🛡️ ESCUDO ACTIVADO: La base de datos bloqueó correctamente el duplicado.';
            RAISE NOTICE '✅ PRUEBA DE IDEMPOTENCIA SUPERADA EXITOSAMENTE.';
    END;

    -- 4. Limpieza (Opcional, borrar la prueba)
    -- DELETE FROM public.movimientos WHERE metadata->>'wompi_id' = v_wompi_id_test;

END $$;
