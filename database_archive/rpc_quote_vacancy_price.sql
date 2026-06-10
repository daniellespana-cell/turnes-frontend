-- =========================================================================
-- FUNCTION: rpc_quote_vacancy_price (V5 - Ironclad Plan Detection)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.rpc_quote_vacancy_price(
    p_empresa_id uuid,
    p_type text,           
    p_quantity integer,
    p_payment numeric,     
    p_is_urgent boolean
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_authenticated_user uuid := auth.uid();
    v_profile_plan_raw TEXT;
    v_plan_slug TEXT;
    v_plan_benefits JSONB;
    v_plan_expires_at TIMESTAMP WITH TIME ZONE;
    v_usage_start_date TIMESTAMP WITH TIME ZONE;
    v_used_count integer := 0;
    v_fixed_limit integer := 0;
    
    v_qty integer;
    v_porcentaje_plan numeric;
    v_comision_por_persona numeric := 0;
    v_total_comisiones numeric := 0;
    v_costo_base numeric := 0;
    v_costo_urgente numeric := 0;
    v_total_inversion numeric := 0;
    
    c_fixed_price numeric := 19900;
    c_urgent_price numeric := 7000;
    
    v_remaining_free integer := 0;
    v_billable_qty integer := 0;
BEGIN
    -- 🛡️ SECURITY WALL
    IF v_authenticated_user IS NULL OR (v_authenticated_user != p_empresa_id AND NOT (auth.jwt() ->> 'rol' = 'admin')) THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS' USING ERRCODE = '42501';
    END IF;

    v_qty := GREATEST(0, p_quantity);

    -- 1. OBTENER PERFIL (Con TRIM para evitar espacios fantasmas)
    SELECT TRIM(plan), plan_expires_at INTO v_profile_plan_raw, v_plan_expires_at
    FROM public.perfiles
    WHERE id = p_empresa_id;

    -- 2. DETECTAR PLAN (Detección Agresiva: Slug, Nombre o Match Parcial)
    -- Priorizamos coincidencia exacta de slug para mayor velocidad
    SELECT slug, benefits INTO v_plan_slug, v_plan_benefits
    FROM public.planes
    WHERE (
        slug ILIKE v_profile_plan_raw 
        OR nombre ILIKE '%' || v_profile_plan_raw || '%'
        OR v_profile_plan_raw ILIKE '%' || slug || '%'
    )
    AND (v_plan_expires_at IS NULL OR v_plan_expires_at > NOW())
    ORDER BY (slug ILIKE v_profile_plan_raw) DESC -- Prioridad a coincidencia exacta
    LIMIT 1;

    -- Fallback Garantizado
    IF v_plan_slug IS NULL THEN
        SELECT slug, benefits INTO v_plan_slug, v_plan_benefits
        FROM public.planes WHERE slug = 'basic' LIMIT 1;
        v_plan_slug := 'basic';
    END IF;

    -- 3. CALCULAR CICLO DE USO (Respetando el mes de facturación)
    v_usage_start_date := COALESCE(v_plan_expires_at - interval '30 days', date_trunc('month', now()));
    
    -- 4. CONTAR USO REAL (Ignorando vacantes eliminadas)
    SELECT count(*)::integer INTO v_used_count
    FROM public.vacantes
    WHERE empresa_id = p_empresa_id 
      AND tipo_turno = 'fijo'
      AND status NOT IN ('eliminada')
      AND created_at >= v_usage_start_date;

    -- 5. EXTRACCIÓN DINÁMICA DE BENEFICIOS
    v_fixed_limit := COALESCE((v_plan_benefits->>'fixed_posts_limit')::INTEGER, 0);
    v_porcentaje_plan := COALESCE((v_plan_benefits->>'commission_rate')::NUMERIC, 0.06);
    c_fixed_price := COALESCE((v_plan_benefits->>'fixed_post_price')::NUMERIC, 19900);

    -- Ajuste Senior: Si el plan es Micro/Pro, el límite es sagrado
    IF v_plan_slug = 'micro' AND v_fixed_limit = 0 THEN v_fixed_limit := 7; END IF;
    IF v_plan_slug = 'pro' AND v_fixed_limit = 0 THEN v_fixed_limit := 30; END IF;

    SELECT price INTO c_urgent_price FROM public.microservices WHERE title ILIKE '%Urgente%' LIMIT 1;
    IF c_urgent_price IS NULL THEN c_urgent_price := 7000; END IF;

    -- 6. CÁLCULO FINANCIERO
    IF p_type = 'fijo' THEN
        v_remaining_free := GREATEST(0, v_fixed_limit - v_used_count);
        v_billable_qty := GREATEST(0, v_qty - v_remaining_free);
        v_costo_base := v_billable_qty * c_fixed_price;
    ELSIF p_type = 'temporal' THEN
        v_comision_por_persona := p_payment * v_porcentaje_plan;
        v_total_comisiones := v_comision_por_persona * v_qty;
    END IF;

    IF p_is_urgent THEN v_costo_urgente := c_urgent_price; END IF;
    v_total_inversion := v_costo_base + v_costo_urgente + v_total_comisiones;

    RETURN jsonb_build_object(
        'plan_detected', v_plan_slug,
        'total', v_total_inversion,
        'costoBase', v_costo_base,
        'usedCount', v_used_count,
        'totalLimit', v_fixed_limit,
        'remainingFree', v_remaining_free,
        'isIncluded', (v_fixed_limit > 0 AND v_used_count < v_fixed_limit),
        'comisionPorcentaje', (v_porcentaje_plan * 100),
        'debug_start_date', v_usage_start_date
    );
END;
$$;
