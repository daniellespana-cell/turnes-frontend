-- =========================================================================
-- FUNCTION: fn_calculate_hiring_cost
-- =========================================================================
-- DESCRIPTION:
-- Motor de precios centralizado. Calcula el costo de desbloqueo (Paso 1)
-- cruzando los datos de la vacante con los beneficios del plan de la empresa.
-- Evita que el frontend decida montos financieros.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.fn_calculate_hiring_cost(
    p_application_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vacante_id UUID;
    v_empresa_id UUID;
    v_tipo_turno TEXT;
    v_pago_monto NUMERIC;
    v_plan_slug TEXT;
    v_plan_benefits JSONB;
    v_costo_final NUMERIC := 0;
    v_comision_rate NUMERIC;
BEGIN
    -- 1. Obtener datos de la vacante y empresa
    SELECT v.id, v.empresa_id, v.tipo_turno, v.pago_monto
    INTO v_vacante_id, v_empresa_id, v_tipo_turno, v_pago_monto
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND';
    END IF;

    -- 2. Obtener Plan Activo de la Empresa
    -- Nota: Leemos desde la tabla perfiles (donde se registran las compras)
    -- y cruzamos con planes para obtener los beneficios JSON.
    SELECT pl.slug, pl.benefits
    INTO v_plan_slug, v_plan_benefits
    FROM public.perfiles p
    JOIN public.planes pl ON pl.slug ILIKE p.plan
    WHERE p.id = v_empresa_id AND (p.plan_expires_at IS NULL OR p.plan_expires_at > NOW());

    -- Fallback a Plan Básico si no tiene plan configurado
    IF NOT FOUND THEN
        SELECT slug, benefits INTO v_plan_slug, v_plan_benefits
        FROM public.planes WHERE slug = 'basic' LIMIT 1;
    END IF;

    -- 3. LÓGICA DE PRECIOS SEGÚN TIPO DE TURNO
    
    -- CASO A: TURNO FIJO (Precio plano o gratuito)
    -- Usamos TRIM e ILIKE con comodines para mayor robustez ante deuda técnica de datos
    IF TRIM(v_tipo_turno) ILIKE '%fijo%' THEN
        -- Extraer precio fijo del JSONB (Default 19900 si no existe)
        v_costo_final := COALESCE((v_plan_benefits->>'fixed_post_price')::NUMERIC, 19900);
        
        -- Gratuidad por Plan Pro
        IF v_plan_slug = 'pro' THEN
            v_costo_final := 0;
        END IF;

    -- CASO B: TURNO TEMPORAL (Comisión porcentual)
    ELSE
        -- Seguridad: Validar que el salario pactado no sea irreal o negativo (Exploit prevention)
        IF v_pago_monto < 1000 THEN
            RAISE EXCEPTION 'INVALID_PAYMENT_AMOUNT_FOR_COMMISSION';
        END IF;
        
        -- Extraer tasa de comisión (Default 0.06 si no existe)
        v_comision_rate := COALESCE((v_plan_benefits->>'commission_rate')::NUMERIC, 0.06);
        
        -- Blindaje matemático: Nunca permitir comisiones negativas
        v_costo_final := GREATEST(0::NUMERIC, v_pago_monto * v_comision_rate);
    END IF;

    RETURN ROUND(v_costo_final);
END;
$$;
