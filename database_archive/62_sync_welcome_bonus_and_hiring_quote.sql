-- =========================================================================
-- MIGRATION 62: SYNC WELCOME BONUS ENGINE (QUOTE & EXECUTION ALIGNMENT)
-- =========================================================================
-- Garantiza que el cotizador (rpc_get_hiring_quote) y el ejecutor (rpc_process_protocol_step1_v3)
-- reconozcan de manera unificada el bono de "Primer Turno Temporal Gratis".
--
-- REGLAS ESTRICTAS:
-- 1. Exclusivo para Turnos Temporales/Ocasionales (Turnos Fijos NO aplican).
-- 2. Perfil de empresa al 100% (nombre_comercial, nit_rut, logo_url, sector_industrial).
-- 3. Validación Anti-Sybil por NIT limpio en descuentos_bienvenida_redimidos.
-- =========================================================================

BEGIN;

-- 1. COTIZADOR DE CONTRATACIÓN CON CONOCIMIENTO DEL BONO DE BIENVENIDA
CREATE OR REPLACE FUNCTION public.rpc_get_hiring_quote(
    p_application_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_monto NUMERIC;
    v_original_amount NUMERIC;
    v_tipo_turno TEXT;
    v_plan_slug TEXT;
    v_empresa_id UUID;
    
    -- Variables para evaluación del Bono
    v_nit VARCHAR;
    v_nit_limpio VARCHAR;
    v_has_complete_profile BOOLEAN := FALSE;
    v_is_welcome_bonus_applied BOOLEAN := FALSE;
    v_bonus_reason TEXT := NULL;
    v_is_fijo BOOLEAN := FALSE;
BEGIN
    -- 1. Obtener Costo Base desde el motor de cálculo
    v_monto := public.fn_calculate_hiring_cost(p_application_id);
    v_original_amount := v_monto;

    -- 2. Obtener Metadatos de la Vacante, Empresa y Postulación
    SELECT v.tipo_turno, pl.slug, e.id, e.nit_rut,
           (
               e.nombre_comercial IS NOT NULL AND btrim(e.nombre_comercial) <> '' AND
               e.nit_rut IS NOT NULL AND btrim(e.nit_rut) <> '' AND
               e.logo_url IS NOT NULL AND btrim(e.logo_url) <> '' AND
               e.sector_industrial IS NOT NULL AND btrim(e.sector_industrial) <> ''
           )
    INTO v_tipo_turno, v_plan_slug, v_empresa_id, v_nit, v_has_complete_profile
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    JOIN public.empresas e ON e.id = v.empresa_id
    LEFT JOIN public.planes pl ON pl.id = e.plan_id
    WHERE p.id = p_application_id;

    IF v_plan_slug IS NULL THEN
        v_plan_slug := 'basic';
    END IF;

    v_is_fijo := (v_tipo_turno IS NOT NULL AND TRIM(v_tipo_turno) ILIKE '%fijo%');

    -- 3. EVALUACIÓN ATÓMICA DEL BONO DE BIENVENIDA
    IF v_is_fijo THEN
        -- Turno Fijo: Estrictamente excluido del bono
        v_is_welcome_bonus_applied := FALSE;
        v_bonus_reason := 'El bono de bienvenida aplica exclusivamente para turnos temporales.';
    ELSE
        -- Turno Temporal: Evaluar elegibilidad
        IF v_nit IS NOT NULL AND v_nit <> '' THEN
            v_nit_limpio := regexp_replace(v_nit, '\D', '', 'g');
        ELSE
            v_nit_limpio := NULL;
        END IF;

        IF NOT v_has_complete_profile THEN
            v_is_welcome_bonus_applied := FALSE;
            v_bonus_reason := 'Debes completar el 100% de tu perfil de empresa (NIT, Logo, Sector) para desbloquear el beneficio.';
        ELSIF v_nit_limpio IS NULL OR v_nit_limpio = '' THEN
            v_is_welcome_bonus_applied := FALSE;
            v_bonus_reason := 'NIT de empresa inválido o no registrado.';
        ELSIF EXISTS (SELECT 1 FROM public.descuentos_bienvenida_redimidos WHERE nit = v_nit_limpio) THEN
            v_is_welcome_bonus_applied := FALSE;
            v_bonus_reason := 'El bono de bienvenida ya fue utilizado para este NIT.';
        ELSE
            -- ✅ CALIFICA: 100% Gratuito en la primera contratación
            v_monto := 0;
            v_is_welcome_bonus_applied := TRUE;
            v_bonus_reason := 'Primer Turno Temporal Gratis (Bono de Bienvenida)';
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'amount', v_monto,
        'original_amount', v_original_amount,
        'is_welcome_bonus_applied', v_is_welcome_bonus_applied,
        'bonus_reason', v_bonus_reason,
        'tipo_turno', v_tipo_turno,
        'is_fijo', v_is_fijo,
        'plan', v_plan_slug
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_hiring_quote(UUID) TO authenticated;


-- 2. EJECUTOR ATÓMICO DEL PASO 1 (ALINEADO CON LA MISMA CONDICIÓN DE PERFIL)
CREATE OR REPLACE FUNCTION public.rpc_process_protocol_step1_v3(
    p_application_id UUID,
    p_candidate_name TEXT DEFAULT 'Candidato'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_empresa_id UUID;
    v_empresa_id_vacante UUID;
    v_monto_a_cobrar NUMERIC;
    v_saldo_actual NUMERIC;
    v_step_actual INTEGER;
    v_is_paid BOOLEAN;
    v_tx_id UUID;
    v_tipo_turno TEXT;
    v_concepto TEXT;
    v_nit VARCHAR;
    v_nit_limpio VARCHAR;
    v_has_complete_profile BOOLEAN := FALSE;
    v_is_fijo BOOLEAN := FALSE;
    v_applied_welcome_bonus BOOLEAN := FALSE;
BEGIN
    -- 1. Seguridad: Solo empresas pueden pagar
    v_empresa_id := auth.uid();
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Bloqueo de Control y Autorización estricta (Zero-Trust)
    SELECT p.step, p.is_paid, v.empresa_id, v.tipo_turno
    INTO v_step_actual, v_is_paid, v_empresa_id_vacante, v_tipo_turno
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.id = p_application_id
    FOR UPDATE OF p;

    IF v_empresa_id_vacante IS NULL OR v_empresa_id_vacante != v_empresa_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED_OR_NOT_FOUND';
    END IF;

    IF v_is_paid = TRUE OR v_step_actual >= 1 THEN
        RETURN jsonb_build_object('success', true, 'message', 'ALREADY_PAID');
    END IF;

    -- 3. CALCULO BASE DE PRECIO
    v_monto_a_cobrar := public.fn_calculate_hiring_cost(p_application_id);
    v_is_fijo := (v_tipo_turno IS NOT NULL AND TRIM(v_tipo_turno) ILIKE '%fijo%');

    -- 4. VALIDACIÓN DEL BONO DE BIENVENIDA
    IF NOT v_is_fijo THEN
        SELECT nit_rut,
               (
                   nombre_comercial IS NOT NULL AND btrim(nombre_comercial) <> '' AND
                   nit_rut IS NOT NULL AND btrim(nit_rut) <> '' AND
                   logo_url IS NOT NULL AND btrim(logo_url) <> '' AND
                   sector_industrial IS NOT NULL AND btrim(sector_industrial) <> ''
               )
        INTO v_nit, v_has_complete_profile
        FROM public.empresas 
        WHERE id = v_empresa_id
        LIMIT 1;

        IF v_nit IS NOT NULL AND v_nit <> '' THEN
            v_nit_limpio := regexp_replace(v_nit, '\D', '', 'g');
        ELSE
            v_nit_limpio := NULL;
        END IF;

        IF v_has_complete_profile AND v_nit_limpio IS NOT NULL AND v_nit_limpio <> '' THEN
            IF NOT EXISTS (SELECT 1 FROM public.descuentos_bienvenida_redimidos WHERE nit = v_nit_limpio) THEN
                v_monto_a_cobrar := 0; -- 100% Bonificado
                v_applied_welcome_bonus := TRUE;

                -- Registrar en tabla anti-Sybil
                INSERT INTO public.descuentos_bienvenida_redimidos (nit, billetera_id)
                VALUES (v_nit_limpio, v_empresa_id)
                ON CONFLICT (nit) DO NOTHING;
            END IF;
        END IF;
    END IF;

    -- 5. Verificación de Billetera
    SELECT saldo INTO v_saldo_actual FROM public.billeteras WHERE id = v_empresa_id FOR UPDATE;
    
    IF v_saldo_actual IS NULL THEN
        INSERT INTO public.billeteras (id, saldo, updated_at) VALUES (v_empresa_id, 0, now());
        v_saldo_actual := 0;
    END IF;

    IF v_saldo_actual < v_monto_a_cobrar THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- 6. Transacción Atómica
    -- A. Descontar Saldo (Si aplica monto > 0)
    IF v_monto_a_cobrar > 0 THEN
        UPDATE public.billeteras 
        SET saldo = saldo - v_monto_a_cobrar, 
            updated_at = now() 
        WHERE id = v_empresa_id;
    END IF;

    -- B. Registrar Movimiento
    IF v_applied_welcome_bonus THEN
        v_concepto := 'Desbloqueo de contacto (Primer Turno Gratis Aplicado): ' || p_candidate_name;
    ELSE
        v_concepto := 'Desbloqueo de contacto: ' || p_candidate_name;
    END IF;

    INSERT INTO public.movimientos (billetera_id, tipo, monto, estado, concepto, referencia)
    VALUES (
        v_empresa_id, 
        'RETIRO', 
        v_monto_a_cobrar, 
        'completado', 
        v_concepto, 
        'STEP1_PAY_' || p_application_id
    ) RETURNING id INTO v_tx_id;

    -- C. Actualizar Postulación
    UPDATE public.postulaciones
    SET step = 1,
        is_paid = true,
        status = 'chat_abierto',
        updated_at = now(),
        protocol_state = jsonb_set(
            COALESCE(protocol_state, '{}'::jsonb), 
            '{payment_step1}', 
            jsonb_build_object(
                'amount', v_monto_a_cobrar, 
                'welcome_bonus_applied', v_applied_welcome_bonus,
                'tx_id', v_tx_id, 
                'timestamp', now()
            )
        )
    WHERE id = p_application_id;

    -- 7. Respuesta
    RETURN jsonb_build_object(
        'success', true,
        'newBalance', v_saldo_actual - v_monto_a_cobrar,
        'amountPaid', v_monto_a_cobrar,
        'welcomeBonusApplied', v_applied_welcome_bonus,
        'txId', v_tx_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_process_protocol_step1_v3(UUID, TEXT) TO authenticated;

COMMIT;
