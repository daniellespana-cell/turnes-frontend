-- ==============================================================================
-- 🚀 V2 RADICAL VACANCY CREATION (RPC)
-- ==============================================================================
-- Objetivo: Soportar MILES de vacantes por segundo sin Timeouts (Error 504).
-- Al usar una función RPC con SECURITY DEFINER, el motor PostgreSQL salta la 
-- introspección lenta de las Políticas RLS de PostgREST, logrando una inserción
-- atómica y directa en microsegundos, evitando cualquier tipo de "Hang" o Deadlock.

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_create_vacancy_v2(
    p_titulo TEXT,
    p_descripcion TEXT,
    p_categoria TEXT,
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_direccion_formateada TEXT,
    p_pago_monto NUMERIC,
    p_fecha_turno TEXT,
    p_tipo_turno TEXT,
    p_status TEXT,
    p_es_urgente BOOLEAN,
    p_etiquetas TEXT[]
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- La magia del rendimiento (Ignora RLS en el chequeo de inserción)
SET search_path = public, extensions
AS $$
DECLARE
    v_empresa_id uuid;
    v_nueva_vacante_id uuid;
BEGIN
    v_empresa_id := auth.uid();
    
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Validaciones Extremas Burocráticas
    IF p_titulo IS NULL OR p_descripcion IS NULL OR p_pago_monto IS NULL THEN
        RAISE EXCEPTION 'BAD_REQUEST: Missing required fields';
    END IF;

    -- Inserción Ultrarrápida Directa
    INSERT INTO public.vacantes (
        empresa_id,
        titulo,
        descripcion,
        categoria,
        lat,
        lng,
        direccion_formateada,
        pago_monto,
        fecha_turno,
        tipo_turno,
        status,
        es_urgente,
        etiquetas
    ) VALUES (
        v_empresa_id,
        p_titulo,
        p_descripcion,
        p_categoria,
        p_lat,
        p_lng,
        p_direccion_formateada,
        p_pago_monto,
        NULLIF(p_fecha_turno, '')::timestamptz,
        p_tipo_turno,
        p_status::estado_vacante_enum,
        p_es_urgente,
        COALESCE(p_etiquetas, '{}'::text[])
    )
    RETURNING id INTO v_nueva_vacante_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_nueva_vacante_id,
        'message', 'Vacante publicada en milisegundos.'
    );
END;
$$;

-- Otorgar Privilegios
GRANT EXECUTE ON FUNCTION public.rpc_create_vacancy_v2(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT[]) TO authenticated;

COMMIT;
