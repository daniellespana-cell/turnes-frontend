-- 🛠️ 27_rpc_close_vacancy_v2.sql
-- OBJETIVO: Cierre manual de vacantes con limpieza atómica y notificaciones.
-- REEMPLAZA: rpc_close_vacancy_v1 (JOIN incorrecto en empresas)

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
    v_affected_count INT;
BEGIN
    v_employer_id := auth.uid();

    -- 1. VALIDACIÓN + RESOLUCIÓN DE NOMBRE
    -- empresa_id en vacantes = auth.uid() del dueño
    -- empresas.user_id = auth.uid() del dueño (FK correcta)
    SELECT v.titulo, e.nombre_comercial INTO v_vacancy_title, v_company_name
    FROM public.vacantes v
    JOIN public.empresas e ON e.user_id = v.empresa_id
    WHERE v.id = p_vacancy_id AND v.empresa_id = v_employer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED: No tienes permisos sobre esta vacante.';
    END IF;

    -- 2. CERRAR VACANTE
    UPDATE public.vacantes
    SET status = 'cerrada',
        updated_at = now()
    WHERE id = p_vacancy_id;

    -- 3. NOTIFICAR PENDIENTES (batch insert)
    INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
    SELECT 
        user_id,
        'VACANCY_CLOSED',
        p_vacancy_id,
        jsonb_build_object(
            'companyName', COALESCE(v_company_name, 'Una empresa'),
            'jobTitle', COALESCE(v_vacancy_title, 'Vacante'),
            'message', 'El proceso de selección ha finalizado. ¡Gracias por participar!'
        )
    FROM public.postulaciones
    WHERE vacante_id = p_vacancy_id 
      AND status IN ('pendiente', 'chat_abierto', 'visto');

    -- 4. FINALIZAR POSTULACIONES
    UPDATE public.postulaciones
    SET status = 'finalizado',
        updated_at = now()
    WHERE vacante_id = p_vacancy_id 
      AND status IN ('pendiente', 'chat_abierto', 'visto');

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'vacancyTitle', COALESCE(v_vacancy_title, 'Vacante'),
        'affectedCount', v_affected_count
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_close_vacancy_v1(uuid) TO authenticated;

COMMIT;
