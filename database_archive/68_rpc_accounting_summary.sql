-- ==============================================================================
-- 🏛️ TURNES ACCOUNTING & FISCAL ENGINE (VERSION 1.0)
-- Objetivo: Consolidación contable oficial por empresa para generación de comprobantes
-- individuales de turno y exportación para software contable (Siigo / Alegra / Helisa).
-- Cumplimiento: Soporte tributario Art. 771-2 del Estatuto Tributario Colombiano.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_get_accounting_summary(
    p_empresa_id UUID,
    p_fecha_inicio TIMESTAMPTZ DEFAULT (now() - interval '30 days'),
    p_fecha_fin TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
    movimiento_id UUID,
    fecha TIMESTAMPTZ,
    tipo_movimiento TEXT,
    concepto TEXT,
    referencia TEXT,
    monto_total NUMERIC,
    tarifa_operativa NUMERIC,
    comision_turnes NUMERIC,
    trabajador_nombre TEXT,
    trabajador_id UUID,
    categoria_turno TEXT,
    vacante_titulo TEXT,
    empresa_nombre TEXT,
    empresa_nit TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_caller_id UUID;
    v_is_admin BOOLEAN := FALSE;
    v_emp_nombre TEXT;
    v_emp_nit TEXT;
BEGIN
    v_caller_id := auth.uid();
    
    -- 1. Control de Autorización Estricto (Zero-Trust)
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Verificar si el invocador es la misma empresa o un administrador
    IF v_caller_id <> p_empresa_id THEN
        SELECT (rol = 'admin') INTO v_is_admin FROM public.perfiles WHERE id = v_caller_id;
        IF NOT COALESCE(v_is_admin, FALSE) THEN
            RAISE EXCEPTION 'FORBIDDEN: You can only query your own company accounting records';
        END IF;
    END IF;

    -- 2. Obtener datos fiscales de la empresa
    SELECT 
        COALESCE(e.nombre_comercial, 'Empresa Turnes'),
        COALESCE(e.nit_rut, '900.000.000-0')
    INTO v_emp_nombre, v_emp_nit
    FROM public.empresas e
    WHERE e.id = p_empresa_id;

    -- 3. Retornar movimientos consolidados del período
    RETURN QUERY
    SELECT 
        m.id AS movimiento_id,
        m.created_at AS fecha,
        m.tipo AS tipo_movimiento,
        m.concepto,
        m.referencia,
        ABS(m.monto) AS monto_total,
        CASE 
            WHEN m.referencia LIKE 'STEP1_PAY_%' THEN
                COALESCE(
                    (p.protocol_state->'payment_step1'->>'shift_cost')::NUMERIC,
                    (v.monto_pago)::NUMERIC,
                    ABS(m.monto)
                )
            ELSE 0
        END AS tarifa_operativa,
        CASE 
            WHEN m.referencia LIKE 'STEP1_PAY_%' THEN
                COALESCE(
                    (p.protocol_state->'payment_step1'->>'commission_amount')::NUMERIC,
                    0
                )
            WHEN m.tipo = 'PAGO_SERVICIO' THEN
                ABS(m.monto)
            ELSE 0
        END AS comision_turnes,
        COALESCE(perf.nombre_completo, 'No aplica') AS trabajador_nombre,
        p.candidato_id AS trabajador_id,
        COALESCE(v.categoria, 'General') AS categoria_turno,
        COALESCE(v.titulo, m.concepto) AS vacante_titulo,
        COALESCE(v_emp_nombre, 'Empresa Turnes') AS empresa_nombre,
        COALESCE(v_emp_nit, 'N/A') AS empresa_nit
    FROM public.movimientos m
    LEFT JOIN public.postulaciones p 
        ON m.referencia = ('STEP1_PAY_' || p.id::TEXT)
    LEFT JOIN public.vacantes v 
        ON p.vacante_id = v.id
    LEFT JOIN public.perfiles perf 
        ON p.candidato_id = perf.id
    WHERE m.billetera_id = p_empresa_id
      AND m.created_at >= p_fecha_inicio
      AND m.created_at <= p_fecha_fin
      AND (m.estado = 'completado' OR m.estado = 'approved')
    ORDER BY m.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_get_accounting_summary(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

COMMIT;
