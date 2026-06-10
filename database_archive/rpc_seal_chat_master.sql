-- 🛡️ rpc_seal_chat_master.sql
-- Master definition for Step 4 (Sealing the Chat / Booking)
-- Incorporates robust COALESCE handlers for JSON arrays and permits all valid pre-booking states.

BEGIN;

DROP FUNCTION IF EXISTS public.rpc_seal_chat(uuid);

CREATE OR REPLACE FUNCTION public.rpc_seal_chat(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_current_step int;
    v_status varchar;
    v_vacante_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN 
        RAISE EXCEPTION 'UNAUTHORIZED'; 
    END IF;

    -- 1. Verificación de propiedad (Empresa) y extracción de datos
    SELECT p.step, p.status, p.vacante_id INTO v_current_step, v_status, v_vacante_id
    FROM postulaciones p 
    JOIN vacantes v ON v.id = p.vacante_id 
    WHERE p.id = p_application_id AND v.empresa_id = v_user_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'UNAUTHORIZED: Application not found or you are not the owner.'; 
    END IF;
    
    -- 2. Permitir sellar en cualquier estado activo previo a la calificación
    IF v_status NOT IN ('pendiente', 'chat_iniciado', 'agendado', 'aceptado', 'contratado') THEN 
        RAISE EXCEPTION 'CANNOT_SEAL_STATUS_IS_%', v_status; 
    END IF;
    
    -- 3. Sellar la Postulación (Avanzar al Paso 4 y fijar estado "contratado" para habilitar las Reseñas)
    UPDATE postulaciones 
    SET step = 4, 
        status = 'contratado',
        protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('step4_sealed_at', now()), 
        updated_at = now()
    WHERE id = p_application_id;

    -- 4. Winner-Takes-All: Desactivar la vacante pública para no recibir más candidatos
    UPDATE vacantes
    SET status = 'cerrada', 
        closed_at = COALESCE(closed_at, now()),
        updated_at = now()
    WHERE id = v_vacante_id AND status != 'cerrada';

    RETURN jsonb_build_object(
        'success', true, 
        'new_status', 'contratado', 
        'step', 4
    );
END;
$$;

-- Otorgar permisos globales
GRANT EXECUTE ON FUNCTION public.rpc_seal_chat(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_seal_chat(uuid) TO anon;

COMMIT;
