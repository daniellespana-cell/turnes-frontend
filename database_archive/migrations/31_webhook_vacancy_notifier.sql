-- =========================================================================
-- 31_webhook_vacancy_notifier.sql
-- OBJETIVO: Crear el Webhook de Base de Datos para disparar la Edge Function 
-- 'vacancy-match-notifier' cuando se inserte una nueva vacante.
-- =========================================================================

-- 1. Asegurarnos que la extensión pg_net está habilitada (requerida por Supabase Webhooks)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Eliminar el trigger si ya existe para evitar duplicados
DROP TRIGGER IF EXISTS trigger_vacancy_webhook ON public.vacantes;
DROP FUNCTION IF EXISTS public.fn_vacancy_webhook_handler();

-- 3. Crear la función del trigger que llamará al webhook
CREATE OR REPLACE FUNCTION public.fn_vacancy_webhook_handler()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook_url text;
  v_supabase_url text;
  v_service_role_key text;
  v_payload jsonb;
  v_request_id bigint;
BEGIN
  -- Solo disparamos el webhook si el status es 'activa'
  IF NEW.status != 'activa' THEN
    RETURN NEW;
  END IF;

  -- 🛑 NOTA: En un entorno productivo de Supabase, los webhooks nativos se crean desde
  -- el Dashboard de Supabase (Database -> Webhooks).
  -- Sin embargo, si usamos pg_net directamente:
  
  -- Las credenciales normalmente deben leerse de Vault o variables de entorno del servidor.
  -- Usaremos un placeholder para el script.
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Construir URL del webhook
  v_webhook_url := v_supabase_url || '/functions/v1/vacancy-match-notifier';

  -- Construir el payload estándar de Webhooks de Supabase
  v_payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'vacantes',
    'schema', 'public',
    'record', to_jsonb(NEW)
  );

  -- Si las credenciales no están disponibles, registramos una advertencia
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE WARNING 'Supabase URL o Service Role Key no configuradas en pg_settings. Usa el Dashboard de Supabase para configurar el Webhook de forma visual.';
    RETURN NEW;
  END IF;

  -- Disparar la petición HTTP asíncrona usando pg_net
  SELECT net.http_post(
      url:='v_webhook_url',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body:=v_payload
  ) INTO v_request_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- El webhook no debe bloquear la inserción de la vacante bajo ninguna circunstancia
  RAISE WARNING 'Error disparando webhook de vacantes: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear el Trigger en la tabla vacantes
CREATE TRIGGER trigger_vacancy_webhook
AFTER INSERT ON public.vacantes
FOR EACH ROW
EXECUTE FUNCTION public.fn_vacancy_webhook_handler();

-- =========================================================================
-- IMPORTANTE:
-- Aunque este script crea el trigger manual usando pg_net, la mejor práctica en
-- Supabase es crear el Webhook directamente desde la Interfaz Gráfica:
-- 1. Ve a Database -> Webhooks
-- 2. Create Webhook -> "Vacancy Match Notifier"
-- 3. Tabla: vacantes, Evento: Insert
-- 4. HTTP Request -> Method: POST, URL: https://[PROYECTO].supabase.co/functions/v1/vacancy-match-notifier
-- 5. Headers: Authorization: Bearer [ANON_KEY o SERVICE_ROLE_KEY]
-- =========================================================================
