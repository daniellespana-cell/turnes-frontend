BEGIN;

DROP FUNCTION IF EXISTS public.rpc_create_vacancy_v3(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT[]);

-- =========================================================================
-- FUNCTION: rpc_create_vacancy_v3 (V6 - Free Publication Edition)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.rpc_create_vacancy_v3(
    p_titulo TEXT,
    p_descripcion TEXT,
    p_categoria TEXT,
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_direccion_formateada TEXT,
    p_pago_monto NUMERIC,
    p_fecha_turno TEXT,
    p_tipo_turno TEXT, -- 'temporal' o 'fijo'
    p_status TEXT,
    p_es_urgente BOOLEAN,
    p_etiquetas TEXT[],
    p_tipo_turno_id TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_empresa_id uuid := auth.uid();
    v_nueva_vacante_id uuid;
    v_quote jsonb;
    v_total_cost numeric;
    v_user_balance numeric;
    v_billetera_id uuid;
BEGIN
    -- 1. IDENTIDAD
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Debes estar autenticado.';
    END IF;

    -- 2. BLOQUEO DE INTEGRIDAD (Serializa las peticiones para evitar el "Doble Gasto" de beneficios)
    PERFORM 1 FROM public.perfiles WHERE id = v_empresa_id FOR UPDATE;

    -- 3. COTIZACIÓN REAL (Reutilizamos la lógica del descontador dinámico)
    -- Invocamos el RPC de cotización para saber cuánto debe pagar ESTE usuario HOY
    SELECT rpc_quote_vacancy_price(
        v_empresa_id, 
        p_tipo_turno, 
        1, 
        p_pago_monto, 
        COALESCE(p_es_urgente, false)
    ) INTO v_quote;

    v_total_cost := (v_quote->>'total')::NUMERIC;

    -- 3. VALIDACIÓN FINANCIERA ELIMINADA (V6 - Publicación Libre)
    -- El cobro de comisiones y uso de saldo se delega al paso de Contratación (ContactSidebar).
    -- La vacante se inserta directamente.

    -- 5. INSERCIÓN DE LA VACANTE (Solo si el pago fue exitoso o es gratis)
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
        tipo_turno_id,
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
        p_tipo_turno_id,
        p_status::estado_vacante_enum,
        p_es_urgente,
        COALESCE(p_etiquetas, '{}'::text[])
    )
    RETURNING id INTO v_nueva_vacante_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_nueva_vacante_id,
        'message', 'Publicación exitosa (Cobro diferido a la contratación)'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_create_vacancy_v3 TO authenticated;

COMMIT;
