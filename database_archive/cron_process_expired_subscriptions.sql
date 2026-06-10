-- ⚙️ PASO 3: EL MOTOR DE DEGRADACIÓN (DOWNGRADE ENGINE CRON)
-- Este proceso correrá todos los días a las 00:00 UTC silenciosamente.
-- Buscará cualquier plan vencido y lo bajará a 'Básico'.

-- 1. Crear la función del sistema que hace la barredora
CREATE OR REPLACE FUNCTION public.system_process_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- Registramos cuántos van a vencer (Opcional, para monitoreo)
    -- RAISE NOTICE 'Iniciando limpieza de suscripciones vencidas';

    -- Aplicamos el Downgrade Masivo a 'Básico' para los vencidos, y reseteamos variables
    UPDATE public.perfiles
    SET plan = 'Básico',
        plan_expires_at = NULL,
        cancel_at_period_end = false,
        updated_at = NOW()
    WHERE plan != 'Básico' 
      AND plan_expires_at IS NOT NULL 
      AND plan_expires_at <= NOW();
      
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Borrar cron viejo si existiera (por precaución)
-- SELECT cron.unschedule('motor-downgrade-diario');

-- 3. Inyectar la barredora en pg_cron (Corre a medianoche 00:00 todos los días)
SELECT cron.schedule(
    'motor-downgrade-diario',
    '0 0 * * *',
    $$ SELECT public.system_process_expired_subscriptions(); $$
);
