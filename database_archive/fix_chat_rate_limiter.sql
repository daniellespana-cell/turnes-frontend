-- fix_chat_rate_limiter.sql
-- 🛡️ FIREWALL ANTI-DDOS / ANTI-SPAM PARA EL CHAT 
-- Evita ataques de inserción masiva (Denial of Wallet).

BEGIN;

-- 1. Crear el Trigger Function
CREATE OR REPLACE FUNCTION trigger_enforce_chat_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_recent_messages int;
BEGIN
    -- Permitir que el sistema interno no tenga restricciones
    IF NEW.sender_id::text = 'system' THEN
        RETURN NEW;
    END IF;

    -- Conteo de mensajes del mismo remitente en los últimos 4 segundos
    SELECT COUNT(*)
    INTO v_recent_messages
    FROM mensajes
    WHERE sender_id = NEW.sender_id
      AND created_at >= (now() - interval '4 seconds');

    -- Si envió 4 o más mensajes en esa ventana de 4 segundos, lo bloqueamos
    IF v_recent_messages >= 4 THEN
        RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Por favor espera un momento antes de enviar más mensajes.' 
        USING ERRCODE = 'P0002'; -- ErrCode custom o PlpgSQL standard para RateLimit
    END IF;

    -- Validación Muro Anti-Bloat (Disco)
    IF length(NEW.content) > 4000 THEN
        RAISE EXCEPTION 'PAYLOAD_TOO_LARGE: El mensaje excede la longitud permitida.' 
        USING ERRCODE = '22001'; -- String data right truncation
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Eliminar el trigger si existía previamente para evitar duplicados
DROP TRIGGER IF EXISTS trg_chat_rate_limiter ON mensajes;

-- 3. Adjuntar el Trigger a la tabla de mensajes ANTES de la inserción
CREATE TRIGGER trg_chat_rate_limiter
BEFORE INSERT ON mensajes
FOR EACH ROW
EXECUTE FUNCTION trigger_enforce_chat_rate_limit();

COMMIT;
