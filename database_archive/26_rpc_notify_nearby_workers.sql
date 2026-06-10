-- 26_rpc_notify_nearby_workers.sql
-- Descripción: Notifica a todos los trabajadores en un radio X de una nueva vacante.
-- Utiliza PostGIS para cruzar las coordenadas de la vacante vs los perfiles de postulantes.

CREATE OR REPLACE FUNCTION public.rpc_notify_nearby_workers(
    p_vacante_id UUID,
    p_radio_km NUMERIC DEFAULT 15
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vacante public.vacantes%ROWTYPE;
    v_company_name TEXT;
    v_worker_id UUID;
    v_count INT := 0;
BEGIN
    -- 1. Obtener la vacante y sus coordenadas
    SELECT * INTO v_vacante FROM public.vacantes WHERE id = p_vacante_id;
    
    IF NOT FOUND OR v_vacante.lat IS NULL OR v_vacante.lng IS NULL THEN
        RAISE NOTICE 'Vacante % no encontrada o sin coordenadas.', p_vacante_id;
        RETURN;
    END IF;

    -- 2. Obtener el nombre de la empresa
    SELECT nombre_comercial INTO v_company_name 
    FROM public.empresas 
    WHERE id = v_vacante.empresa_id;

    -- 3. Buscar postulantes activos cercanos e insertar notificaciones
    FOR v_worker_id IN 
        SELECT id 
        FROM public.perfiles 
        WHERE rol = 'postulante'
          AND lat IS NOT NULL 
          AND lng IS NOT NULL
          -- st_distance sphere retorna metros. radio_km * 1000
          AND ST_Distance(
                ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(v_vacante.lng, v_vacante.lat), 4326)::geography
              ) <= (p_radio_km * 1000)
    LOOP
        -- Insertar notificación atómicamente
        INSERT INTO public.notificaciones (
            user_id,
            tipo,
            reference_id,
            metadata
        ) VALUES (
            v_worker_id,
            'NEW_JOB_ZONE',
            p_vacante_id,
            jsonb_build_object(
                'jobTitle', v_vacante.titulo,
                'companyName', COALESCE(v_company_name, 'Una empresa local')
            )
        );

        v_count := v_count + 1;
    END LOOP;

    RAISE NOTICE 'Se notificaron % trabajadores cercanos a la vacante %', v_count, p_vacante_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.rpc_notify_nearby_workers(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_notify_nearby_workers(UUID, NUMERIC) TO service_role;
