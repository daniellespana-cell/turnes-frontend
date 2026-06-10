-- 🛡️ PARCHE DE SEGURIDAD: BYPASS DE PAGO MÍNIMO EN VACANTES
-- Previene que atacantes intercepten la red y creen vacantes ofreciendo pagos basura ($1 peso).

DO $$
BEGIN
    -- 1. Intentar eliminar la restricción si ya existe (para evitar errores en ejecuciones múltiples)
    BEGIN
        ALTER TABLE public.vacantes DROP CONSTRAINT IF EXISTS vacantes_pago_minimo_check;
    EXCEPTION
        WHEN undefined_object THEN
            NULL;
    END;

    -- 2. Limpiar datos existentes (Subir el pago a 50k para las vacantes que violen la regla)
    UPDATE public.vacantes
    SET pago_monto = 50000
    WHERE pago_monto IS NOT NULL AND pago_monto < 50000;

    -- 3. Añadir la restricción inquebrantable a nivel de base de datos
    -- Nota: Permite NULL en caso de vacantes que no lleven pago, pero si lo llevan, debe ser >= 50k
    ALTER TABLE public.vacantes 
    ADD CONSTRAINT vacantes_pago_minimo_check 
    CHECK (pago_monto IS NULL OR pago_monto >= 50000);

    RAISE NOTICE '✅ Escudo de base de datos activado. Las vacantes basura han sido bloqueadas a nivel de servidor.';
END $$;
