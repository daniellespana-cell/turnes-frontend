-- 🛡️ RPC: DESCARTE SEGURO DE CALIFICACIÓN
-- Objetivo: Marcar como ignorado sin borrar el resto del protocol_state (JSONB Merge)
CREATE OR REPLACE FUNCTION public.rpc_dismiss_worker_rating(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.postulaciones
    SET protocol_state = COALESCE(protocol_state, '{}'::jsonb) || jsonb_build_object('candidato_ignored_rating', true),
        updated_at = now()
    WHERE id = p_application_id;
END;
$$;
