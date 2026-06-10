-- Configuración de Cron (Pg_Cron) en Supabase
-- Ejecutar vía el SQL Editor de Supabase
-- Requiere tener activada la extensión "pg_cron" y "pg_net"

-- PASO PREVIO VITAL: Habilitar las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Asegura que la tabla tiene la columna
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- (Opcional, SOLO USAR esto si necesitas sobreescribirlo o cambiar la hora. 
-- Como es la primera vez, comento esta línea para que no te dé error)
-- SELECT cron.unschedule('mandar-recordatorios-diarios');

-- Programar el Job
-- 0 8 * * * = A las 8:00 AM todos los días (Hora UTC. Si quieres hora local Colombia (-5), ajusta a '0 13 * * *' para las 8am Colombia)
SELECT cron.schedule(
  'mandar-recordatorios-diarios',
  '0 13 * * *', 
  $$
  SELECT net.http_post(
      -- REEMPLAZAR ESTA URL por la URL real de Edge Function tuya
      url:='https://llrveqigkgyafgzofoqh.supabase.co/functions/v1/send-renewal-reminders',
      headers:='{"Authorization": "Bearer AQUI_TU_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
