-- =========================================================
-- 27_notification_triggers.sql
-- Automatización de Notificaciones (The Senior Way)
-- Movemos la lógica de "dispatch" del frontend al backend.
-- =========================================================

-- 1. FUNCIÓN: NOTIFICAR MENSAJE DE CHAT
CREATE OR REPLACE FUNCTION public.fn_on_chat_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_sender_name TEXT;
    v_message_preview TEXT;
    v_msg_count INT;
    v_is_system_rehire BOOLEAN;
BEGIN
    -- 1. Identificar al destinatario mediante la tabla de relación turnes_chats
    SELECT 
        CASE 
            WHEN NEW.sender_id = c.empresa_id THEN c.postulante_id 
            ELSE c.empresa_id 
        END INTO v_recipient_id
    FROM public.turnes_chats c
    WHERE c.id = NEW.conversacion_id;

    -- 2. Obtener el nombre del emisor para el preview
    SELECT nombre_display INTO v_sender_name FROM perfiles WHERE id = NEW.sender_id;

    -- 3. Crear el preview del mensaje
    v_message_preview := CASE 
        WHEN length(NEW.content) > 30 THEN left(NEW.content, 30) || '...'
        ELSE NEW.content
    END;

    -- 4. Contar historial de la conversación para saber si es el primer mensaje
    SELECT COUNT(*) INTO v_msg_count FROM public.mensajes WHERE conversacion_id = NEW.conversacion_id;

    -- 5. Detectar si es un mensaje especial de recontratación
    v_is_system_rehire := (NEW.tipo = 'system_info' AND NEW.metadata->>'subtype' = 'rehire_accepted');

    -- 6. Disparar notificación (Solo el PRIMER mensaje de la conversación o Recontratación)
    IF v_recipient_id IS NOT NULL AND NEW.content NOT LIKE 'Pago de comisión%' THEN
        IF v_msg_count = 1 OR v_is_system_rehire THEN
            PERFORM public.rpc_create_notification(
                v_recipient_id,
                'CHAT_MESSAGE',
                NEW.conversacion_id,
                jsonb_build_object(
                    'senderName', COALESCE(v_sender_name, 'Alguien'),
                    'messagePreview', v_message_preview
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNCIÓN: NOTIFICAR CICLO DE VIDA (POSTULACIÓN -> MATCH -> CIERRE)
CREATE OR REPLACE FUNCTION public.fn_on_match_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_candidate_name TEXT;
    v_job_title TEXT;
    v_employer_id UUID;
BEGIN
    -- Obtener nombres para los mensajes
    SELECT nombre_display INTO v_candidate_name FROM perfiles WHERE id = NEW.user_id;
    SELECT titulo, empresa_id INTO v_job_title, v_employer_id FROM vacantes WHERE id = NEW.vacante_id;

    -- Caso 1: Nueva Postulación (Notificar a la EMPRESA)
    IF (TG_OP = 'INSERT') THEN
        PERFORM public.rpc_create_notification(
            v_employer_id,
            'JOB_APPLIED',
            NEW.id,
            jsonb_build_object(
                'candidateName', COALESCE(v_candidate_name, 'Un talento'),
                'jobTitle', COALESCE(v_job_title, 'tu vacante'),
                'vacanteId', NEW.vacante_id
            )
        );

    -- Caso 2: Match Establecido o Invitación Aceptada
    ELSIF (TG_OP = 'UPDATE') AND 
          (NEW.status = 'chat_abierto' OR NEW.status = 'aceptado') AND 
          (OLD.status != NEW.status) THEN
        
        IF (NEW.protocol_state->>'is_invitation' = 'true') THEN
            -- La empresa lo invitó, y el candidato acaba de aceptar. Notificar a la EMPRESA.
            PERFORM public.rpc_create_notification(
                v_employer_id,
                'INVITATION_ACCEPTED',
                NEW.id,
                jsonb_build_object(
                    'candidateName', COALESCE(v_candidate_name, 'Un talento'),
                    'jobTitle', COALESCE(v_job_title, 'tu vacante')
                )
            );
        ELSE
            -- Match regular iniciado por la empresa. Notificar al CANDIDATO.
            PERFORM public.rpc_create_notification(
                NEW.user_id,
                'MATCH_ESTABLISHED',
                NEW.id,
                jsonb_build_object(
                    'jobTitle', COALESCE(v_job_title, 'una vacante'),
                    'companyName', COALESCE((SELECT nombre_comercial FROM empresas WHERE id = v_employer_id), 'Una empresa'),
                    'candidateName', COALESCE(v_candidate_name, 'Un talento')
                )
            );
        END IF;

    -- Caso 3: Turno Finalizado / Sellado (Notificar al CANDIDATO)
    ELSIF (TG_OP = 'UPDATE') AND 
          (NEW.status = 'finalizado') AND 
          (OLD.status != 'finalizado') THEN
        
        PERFORM public.rpc_create_notification(
            NEW.user_id,
            'CONTRACT_SEALED',
            NEW.id,
            jsonb_build_object(
                'jobTitle', COALESCE(v_job_title, 'el turno'),
                'companyName', COALESCE((SELECT nombre_comercial FROM empresas WHERE id = v_employer_id), 'El empleador')
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCIÓN: NOTIFICAR CALIFICACIÓN RECIBIDA
CREATE OR REPLACE FUNCTION public.fn_on_rating_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_author_name TEXT;
BEGIN
    SELECT nombre_display INTO v_author_name FROM perfiles WHERE id = NEW.author_id;

    PERFORM public.rpc_create_notification(
        NEW.target_id,
        'RATING_RECEIVED',
        NEW.shift_id,
        jsonb_build_object(
            'authorName', COALESCE(v_author_name, 'Alguien'),
            'rating', NEW.rating
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCIÓN: NOTIFICAR NUEVA VACANTE EN LA ZONA (FAN-OUT AUTOMÁTICO)
CREATE OR REPLACE FUNCTION public.fn_on_vacancy_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Disparar el motor espacial en segundo plano (Background RPC)
    -- El radio por defecto es 15km
    PERFORM public.rpc_notify_nearby_workers(NEW.id, 15);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCIÓN: NOTIFICAR PAGO DE COMISIÓN (Detección por Referencia)
CREATE OR REPLACE FUNCTION public.fn_on_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_application_id UUID;
    v_candidate_id UUID;
    v_employer_id UUID;
    v_job_title TEXT;
    v_candidate_name TEXT;
    v_company_name TEXT;
BEGIN
    -- Detectar pagos de Protocolo Step 1
    IF (NEW.referencia LIKE 'STEP1_PAYMENT:%') THEN
        v_application_id := (substring(NEW.referencia from 'STEP1_PAYMENT:(.*)'))::UUID;

        -- Obtener datos de la postulación y nombres
        SELECT 
            p.user_id, v.empresa_id, v.titulo, 
            per_c.nombre_display, per_e.nombre_display
        INTO v_candidate_id, v_employer_id, v_job_title, v_candidate_name, v_company_name
        FROM public.postulaciones p
        JOIN public.vacantes v ON v.id = p.vacante_id
        LEFT JOIN public.perfiles per_c ON per_c.id = p.user_id
        LEFT JOIN public.perfiles per_e ON per_e.id = v.empresa_id
        WHERE p.id = v_application_id;

        -- 1. SENIOR PRIVACY: El trabajador NO recibe esta notificación (Silenciado)
        -- Solo activamos para la empresa abajo.

        -- 2. Notificar a la EMPRESA (Confirmación)
        PERFORM public.rpc_create_notification(
            v_employer_id,
            'PAYMENT_SUCCESS',
            v_application_id,
            jsonb_build_object(
                'candidateName', COALESCE(v_candidate_name, 'El candidato'),
                'amount', (NEW.monto)::TEXT
            )
        );
        
    -- Detectar recargas de billetera
    ELSIF (NEW.tipo = 'DEPOSITO' AND (NEW.referencia LIKE '%-recharge-wallet-%' OR NEW.metadata->>'item_type' = 'recharge' OR NEW.concepto LIKE 'Recarga%')) THEN
        PERFORM public.rpc_create_notification(
            NEW.billetera_id,
            'RECHARGE_SUCCESS',
            NEW.billetera_id, -- usando la billetera como entidad relacionada
            jsonb_build_object(
                'amount', (NEW.monto)::TEXT
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREACIÓN DE TRIGGERS
-- Trigger para Mensajes
DROP TRIGGER IF EXISTS tr_notify_chat_message ON public.mensajes;
CREATE TRIGGER tr_notify_chat_message
    AFTER INSERT ON public.mensajes
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_chat_message_notification();

-- Trigger para Ciclo de Vida de Postulación (Insert y Update)
DROP TRIGGER IF EXISTS tr_notify_postulacion_lifecycle ON public.postulaciones;
CREATE TRIGGER tr_notify_postulacion_lifecycle
    AFTER INSERT OR UPDATE OF status ON public.postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_match_notification();

-- Trigger para Calificaciones
DROP TRIGGER IF EXISTS tr_notify_rating ON public.reviews;
CREATE TRIGGER tr_notify_rating
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_rating_notification();

-- Trigger para Nuevas Vacantes (Zonal Fan-out)
DROP TRIGGER IF EXISTS tr_notify_new_vacancy ON public.vacantes;
CREATE TRIGGER tr_notify_new_vacancy
    AFTER INSERT ON public.vacantes
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_vacancy_notification();

-- Trigger para Pagos de Comisión
DROP TRIGGER IF EXISTS tr_notify_payment ON public.movimientos;
CREATE TRIGGER tr_notify_payment
    AFTER INSERT ON public.movimientos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_payment_notification();


-- =========================================================
-- NOTA: Este script delega la responsabilidad al motor de DB.
-- Eliminar llamadas manuales a notificationObserver.dispatch() en el JS.
-- =========================================================
