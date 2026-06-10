-- =======================================================================
-- MIGRACIÓN: Columna de Idempotencia para Vacantes
-- Patrón Gold Standard (Stripe / Uber style)
-- 
-- ¿Por qué? La columna actúa como una "ficha única de transacción".
-- Si el cliente intenta crear la misma vacante múltiples veces
-- (doble-tap, retry de red, etc.), PostgreSQL rechaza las copias
-- a nivel de constraint UNIQUE antes de que lleguen a afectar nada.
-- =======================================================================

-- 1. Agregar la columna como nullable primero (para no romper vacantes existentes)
ALTER TABLE public.vacantes
    ADD COLUMN IF NOT EXISTS idempotency_key UUID;

-- 2. Crear un índice UNIQUE que solo aplica a registros CON clave (partial index).
--    Las vacantes antiguas (sin clave) no colisionan entre sí.
CREATE UNIQUE INDEX IF NOT EXISTS idx_vacantes_idempotency_key
    ON public.vacantes(idempotency_key)
    WHERE idempotency_key IS NOT NULL;
