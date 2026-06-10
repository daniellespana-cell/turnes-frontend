-- 🔄 MIGRACIÓN DE DATOS HISTÓRICOS (Legacy Empresas -> Perfiles Modernos)
-- Objetivo: Rescatar suscripciones antiguas (Micro, Pro) guardadas en la tabla 'empresas'
-- y migrarlas a la nueva tabla 'perfiles', asegurando que nadie pierda su plan.

DO $$
DECLARE
    v_updated_count INTEGER := 0;
BEGIN
    -- Actualizar perfiles usando los datos heredados de empresas
    -- Regla de Oro: Solo se actualizan perfiles que actualmente NO tienen un plan premium asignado,
    -- para evitar sobreescribir compras recientes hechas por Wompi.
    UPDATE public.perfiles p
    SET plan = pl.slug,
        -- Asignamos 30 días de gracia desde hoy a los planes heredados si no tienen fecha de expiración registrada
        plan_expires_at = COALESCE(p.plan_expires_at, now() + interval '30 days'),
        updated_at = now()
    FROM public.empresas e
    JOIN public.planes pl ON pl.id = e.plan_id
    WHERE p.id = e.id 
      AND pl.slug IN ('micro', 'pro')
      AND (p.plan IS NULL OR p.plan = '' OR p.plan ILIKE 'basic');
      
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RAISE NOTICE '✅ Migración completada. Se rescataron % suscripciones antiguas y se pasaron a la nueva arquitectura.', v_updated_count;
END $$;
