-- =========================================================================
-- FIX: ENFORCE MATCH FLOW (CHAT BUG)
-- Desc: El chat solo debe nacer cuando la empresa acepta (MATCH).
-- =========================================================================

-- 1. MODIFICAR EL DISPARADOR PARA QUE SEA CONDICIONAL
CREATE OR REPLACE FUNCTION public.crear_chat_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- REGLA DE ORO SENIOR: 
    -- Solo creamos el chat si el status es 'contratado' (Match) o 'chat_abierto' (Pipeline).
    -- Si el status es 'pendiente' (Postulación inicial), NO creamos nada.
    IF NEW.status NOT IN ('contratado', 'chat_abierto') THEN
        RETURN NEW;
    END IF;

    -- Conseguir el ID de la empresa dueña de la vacante
    SELECT empresa_id INTO v_empresa_id FROM public.vacantes WHERE id = NEW.vacante_id;
    
    IF v_empresa_id IS NOT NULL THEN
        INSERT INTO public.turnes_chats (id, empresa_id, postulante_id)
        VALUES (NEW.id, v_empresa_id, NEW.user_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RECONSTRUIR EL TRIGGER PARA ESCUCHAR CAMBIOS DE STATUS
-- Eliminamos el trigger anterior

DROP TRIGGER IF EXISTS trigger_crear_chat ON public.postulaciones;

-- Creamos el nuevo trigger que solo se dispara al insertar o al actualizar status
CREATE TRIGGER trigger_crear_chat
    AFTER INSERT OR UPDATE OF status ON public.postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.crear_chat_automatico();

-- 3. LIMPIEZA DE CHATS ZOMBIS (Opcional, pero recomendado para Senior Clean Up)
-- Eliminamos chats que pertenezcan a postulaciones pendientes (erróneamente creados)
DELETE FROM public.turnes_chats
WHERE id IN (
    SELECT id FROM public.postulaciones WHERE status = 'pendiente'
);
