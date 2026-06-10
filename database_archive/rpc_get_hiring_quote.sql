-- =========================================================================
-- RPC: rpc_get_hiring_quote
-- =========================================================================
-- DESCRIPTION:
-- Obtiene el costo exacto de contratación (Paso 1) desde el backend.
-- Se usa para mostrar el precio en la UI antes de pagar.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_hiring_quote(
    p_application_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_monto NUMERIC;
    v_tipo_turno TEXT;
    v_plan_slug TEXT;
BEGIN
    -- 1. Obtener Costo Atómico
    v_monto := public.fn_calculate_hiring_cost(p_application_id);

    -- 2. Obtener Metadatos para la UI
    SELECT v.tipo_turno, pl.slug
    INTO v_tipo_turno, v_plan_slug
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    JOIN public.empresas e ON e.id = v.empresa_id
    JOIN public.planes pl ON pl.id = e.plan_id
    WHERE p.id = p_application_id;

    RETURN jsonb_build_object(
        'amount', v_monto,
        'tipo_turno', v_tipo_turno,
        'plan', v_plan_slug
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_hiring_quote(UUID) TO authenticated;
