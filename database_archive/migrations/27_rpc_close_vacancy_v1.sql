-- 🛠️ 27_rpc_close_vacancy_v1.sql
-- OBJETIVO: Permitir el cierre manual de vacantes con limpieza masiva.

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_close_vacancy_v1(
    p_vacancy_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_employer_id UUID;
    v_vacancy_title TEXT;
    v_company_name TEXT;
BEGIN
    v_employer_id := auth.uid();

    -- 1. VALIDACIÓN
    SELECT v.titulo, e.nombre_comercial INTO v_vacancy_title, v_company_name
    FROM public.vacantes v
    JOIN public.empresas e ON e.id = v.empresa_id
    WHERE v.id = p_vacancy_id AND v.empresa_id = v_employer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED: No tienes permisos sobre esta vacante.';
    END IF;

    -- 2. CERRAR VACANTE
    UPDATE public.vacantes
    SET status = 'cerrada',
        updated_at = now()
    WHERE id = p_vacancy_id;

    -- 3. NOTIFICAR Y FINALIZAR PENDIENTES
    INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
    SELECT 
        user_id,
        'VACANCY_CLOSED',
        p_vacancy_id,
        jsonb_build_object(
            'companyName', v_company_name,
            'jobTitle', v_vacancy_title,
            'message', 'La empresa ha finalizado el proceso de selección. ¡Gracias por participar!'
        )
    FROM public.postulaciones
    WHERE vacante_id = p_vacancy_id 
      AND status IN ('pendiente', 'chat_abierto', 'visto');

    UPDATE public.postulaciones
    SET status = 'finalizado',
        updated_at = now()
    WHERE vacante_id = p_vacancy_id 
      AND status IN ('pendiente', 'chat_abierto', 'visto');

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Vacante cerrada exitosamente.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_close_vacancy_v1(uuid) TO authenticated;

COMMIT;
