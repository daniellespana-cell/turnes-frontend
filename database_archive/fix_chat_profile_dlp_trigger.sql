-- =========================================================================
-- SCRIPT: FIREWALL DLP PARA CABALLOS DE TROYA (PERFILES Y VACANTES)
-- OBJETIVO: Reutilizar el interceptor del chat en Nombres y Descripciones.
-- VULNERABILIDAD MITIGADA: Usuarios poniendo celulares en su nombre o vacante.
-- =========================================================================

-- Creamos una función genérica que puede leer dinámicamente cualquier columna 
-- (Porque 'mensajes' usa NEW.content, 'perfiles' usa NEW.nombre_display y 'vacantes' usa NEW.descripcion)
CREATE OR REPLACE FUNCTION check_generic_dlp_leakage()
RETURNS TRIGGER AS $$
DECLARE
    texto_evaluar TEXT;
    texto_limpio TEXT;
BEGIN
    -- 1. Identificar qué estamos evaluando según la tabla que disparó el trigger
    IF TG_TABLE_NAME = 'perfiles' THEN
        texto_evaluar := NEW.nombre_display;
    ELSIF TG_TABLE_NAME = 'vacantes' THEN
        texto_evaluar := NEW.descripcion;
    ELSE
        RETURN NEW; -- Ignorar si se pega en otra tabla por error
    END IF;

    -- Si el campo está vacío, lo dejamos pasar
    IF texto_evaluar IS NULL OR TRIM(texto_evaluar) = '' THEN
        RETURN NEW;
    END IF;

    -- 2. DESTRUCCIÓN DE ESPACIOS Y SÍMBOLOS (El mismo motor indoblegable)
    texto_limpio := regexp_replace(texto_evaluar, '[^a-zA-Z0-9]', '', 'g');
    texto_limpio := lower(texto_limpio);
    texto_limpio := replace(texto_limpio, 'o', '0');
    texto_limpio := replace(texto_limpio, 'l', '1');
    texto_limpio := replace(texto_limpio, 'i', '1');

    -- 3. EL MURO: REGLAS DE DETECCIÓN REGEX

    -- Regla 1: Celular Colombiano Convencional
    IF texto_limpio ~ '3[0-9]{9}' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: No puedes incluir números de teléfono en tu %', 
            CASE WHEN TG_TABLE_NAME = 'perfiles' THEN 'Nombre de Perfil' ELSE 'Descripción de Vacante' END;
    END IF;

    -- Regla 2: Lluvia de digitos (Evasión)
    IF texto_limpio ~ '[0-9]{7,}' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: No se permiten secuencias largas de números en tu %',
            CASE WHEN TG_TABLE_NAME = 'perfiles' THEN 'Nombre de Perfil' ELSE 'Descripción de Vacante' END;
    END IF;

    -- Regla 3: Palabras Externas
    IF texto_limpio ~ 'whatsapp|wpp|wapp|celular\d|movil\d' THEN
        RAISE EXCEPTION 'DLP_POLICY_VIOLATION: No puedes invitar a interactuar por fuera de la plataforma';
    END IF;

    -- Todo en orden
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- INSTALACIÓN EN TABLA: PERFILES
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_dlp_perfiles ON public.perfiles;

CREATE TRIGGER trigger_dlp_perfiles
BEFORE INSERT OR UPDATE OF nombre_display ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION check_generic_dlp_leakage();

-- =========================================================================
-- INSTALACIÓN EN TABLA: VACANTES
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_dlp_vacantes ON public.vacantes;

CREATE TRIGGER trigger_dlp_vacantes
BEFORE INSERT OR UPDATE OF descripcion ON public.vacantes
FOR EACH ROW
EXECUTE FUNCTION check_generic_dlp_leakage();
