-- ==============================================================================
-- 31_rpc_worker_dashboard_stats.sql
-- DESCRIPTION: RPC for Worker Dashboard KPIs. Implements CQRS and SSOT.
-- Replaces 3 parallel HTTP requests from the frontend with 1 atomic DB query.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_get_worker_dashboard_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_shifts INT;
    v_total_earned NUMERIC;
    v_active_apps INT;
    v_avg_rating NUMERIC;
    v_result JSON;
BEGIN
    -- 1. Turnos finalizados y ganancias (Unificando Salario post-curación)
    SELECT 
        COUNT(p.id), 
        COALESCE(SUM(GREATEST(COALESCE(v.salario, 0), COALESCE(v.pago_monto, 0))), 0)
    INTO v_total_shifts, v_total_earned
    FROM public.postulaciones p
    JOIN public.vacantes v ON v.id = p.vacante_id
    WHERE p.user_id = p_user_id 
      AND p.status IN ('finalizado', 'contratado');

    -- 2. Postulaciones activas
    SELECT COUNT(id)
    INTO v_active_apps
    FROM public.postulaciones
    WHERE user_id = p_user_id 
      AND status IN ('pendiente', 'aceptado');

    -- 3. Rating promedio (Single Source of Truth -> perfiles)
    -- Leemos directamente de perfiles, delegando el cálculo al trigger existente.
    SELECT COALESCE(calificacion, 0) INTO v_avg_rating
    FROM public.perfiles
    WHERE id = p_user_id;

    -- Construir JSON de respuesta
    v_result := json_build_object(
        'totalShifts', v_total_shifts,
        'totalEarned', v_total_earned,
        'activeApplications', v_active_apps,
        'avgRating', v_avg_rating
    );

    RETURN v_result;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_get_worker_dashboard_stats(UUID) TO authenticated;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ RPC rpc_get_worker_dashboard_stats creado exitosamente.';
END $$;
