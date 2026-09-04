-- ============================================================================
-- 🤖 MOTOR DE EXPIRACIÓN AUTOMÁTICA DE VACANTES
-- ============================================================================
-- Ejecutado por pg_cron cada hora.
-- Solo expira vacantes que:
--   1. Están 'activa'
--   2. Su fecha_turno ya pasó
--   3. NO tienen postulaciones (nadie se postuló)
--
-- También limpia boosts urgentes cuya ventana de 48h ya venció.
-- ============================================================================

-- ── Función principal ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.system_expire_stale_vacancies()
RETURNS void AS $$
BEGIN
    -- 1. Expirar vacantes sin postulaciones cuya fecha ya pasó
    UPDATE public.vacantes
    SET status = 'expirada',
        updated_at = NOW()
    WHERE status = 'activa'
      AND fecha_turno IS NOT NULL
      AND fecha_turno <= NOW()
      AND NOT EXISTS (
          SELECT 1 FROM public.postulaciones
          WHERE postulaciones.vacante_id = vacantes.id
      );

    -- 2. Limpiar boosts urgentes vencidos (independiente del status)
    UPDATE public.vacantes
    SET es_urgente = false,
        updated_at = NOW()
    WHERE es_urgente = true
      AND urgente_expiracion IS NOT NULL
      AND urgente_expiracion <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Cron Job: Cada hora en punto ─────────────────────────────────────────────
-- Sigue el mismo patrón de 'motor-downgrade-diario' y 'mandar-recordatorios-diarios'
SELECT cron.schedule(
    'expirar-vacantes-vencidas',
    '0 * * * *',
    $$SELECT public.system_expire_stale_vacancies()$$
);
