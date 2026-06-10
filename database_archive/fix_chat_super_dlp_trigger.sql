-- =========================================================================
-- SCRIPT: FIREWALL DLP (DATA LEAKAGE PREVENTION) EN POSTGRESQL ("ÁREA 51")
-- OBJETIVO: Bloquear intentos de enviar teléfonos directamente en el Backend
-- VULNERABILIDAD MITIGADA: Hackers usando F12, Postman o Scripts API.
-- =========================================================================

-- 1. Crear o reemplazar la función guardiana DLP
CREATE OR REPLACE FUNCTION check_dlp_leakage()
RETURNS TRIGGER AS $$
DECLARE
    texto_limpio TEXT;
BEGIN
    -- Si el mensaje es nulo o vacío, lo dejamos pasar
    IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
        RETURN NEW;
    END IF;

    -- A) DESTRUCCIÓN DE ESPACIOS Y SÍMBOLOS (Normalización Extrema)
    -- Quitamos todos los espacios, guiones, puntos y caracteres especiales que usan para evadir
    texto_limpio := regexp_replace(NEW.content, '[^a-zA-Z0-9]', '', 'g');
    
    -- Lo convertimos todo a minúsculas
    texto_limpio := lower(texto_limpio);

    -- SUSTITUCIÓN DE LEET SPEAK BÁSICA (Convertir letras a números comunes de evasión)
    texto_limpio := replace(texto_limpio, 'o', '0');
    texto_limpio := replace(texto_limpio, 'l', '1');
    texto_limpio := replace(texto_limpio, 'i', '1');

    -- B) EL MURO: REGLAS DE DETECCIÓN REGEX

    -- Regla 1: Celular Colombiano Convencional (Formato 10 dígitos empezando con 3)
    -- Ej: "3201234567"
    IF texto_limpio ~ '3[0-9]{9}' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: Detectada presunta fuga de datos (Teléfono celular)';
    END IF;

    -- Regla 2: Agrupación Sospechosa de Números (Lluvia de digitos)
    -- Si logran sumar 7 o más dígitos consecutivos después de quitarles los espacios y letras
    -- Ej: "mi num es dos tres cuatro..." -> "234" -> Si llegan a 7 explota.
    IF texto_limpio ~ '[0-9]{7,}' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: Bloqueada evasión alfanumérica de contactos';
    END IF;

    -- Regla 3: Palabras Clave Cero Tolerancia
    -- Busca que la palabra exacta NO esté en el texto limpio sin espacios
    IF texto_limpio ~ 'whatsapp|wpp|wapp|celular\d|movil\d' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: Intento de redirección a canal externo detectado';
    END IF;

    -- Si sobrevive a todo el escrutinio, permitimos la inserción.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Eliminar el trigger si ya existe (para evitar duplicados al correr el script varias veces)
DROP TRIGGER IF EXISTS trigger_dlp_mensajes ON public.mensajes;

-- 3. Adjuntar el Guardián a la Tabla 'mensajes'
-- Se ejecutará ANTES (BEFORE) de que cada nuevo mensaje sea escrito en el disco duro.
CREATE TRIGGER trigger_dlp_mensajes
BEFORE INSERT ON public.mensajes
FOR EACH ROW
EXECUTE FUNCTION check_dlp_leakage();

-- =========================================================================
-- VALIDACIÓN: Como probar el Trigger desde el Frontend
-- =========================================================================
-- Si el usuario usa Postman o F12 y envía un payload a la API REST:
-- { "content": "escribeme al 3 2 0 a o 1 b 2 v 3 - 4 c 5 t 6 , 7" }
-- Supabase responderá con: 
-- HTTP 400 Bad Request
-- { "code": "P0001", "message": "DLP_POLICY_VIOLATION: Detectada presunta fuga..." }
