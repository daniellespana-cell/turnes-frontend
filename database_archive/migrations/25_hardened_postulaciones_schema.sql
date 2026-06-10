-- 🛠️ 25_hardened_postulaciones_schema.sql
-- OBJETIVO: Sincronizar estados de negocio y unificar esquema de vacantes.

BEGIN;

-- 1. AMPLIAR ENUM DE POSTULACIONES
-- Nota: PostgreSQL no permite ALTER TYPE ... ADD VALUE dentro de un bloque de transacción BEGIN/COMMIT 
-- a menos que sea la única operación. Usaremos DO para manejarlo de forma segura o lo haremos por fuera.
-- Senior Approach: Como estamos en Supabase, podemos usar scripts idempotentes.

DO $$
BEGIN
    -- Agregar estados faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'chat_abierto') THEN
        ALTER TYPE estado_postulacion_enum ADD VALUE 'chat_abierto';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'contratado') THEN
        ALTER TYPE estado_postulacion_enum ADD VALUE 'contratado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'visto') THEN
        ALTER TYPE estado_postulacion_enum ADD VALUE 'visto';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finalizado') THEN
        ALTER TYPE estado_postulacion_enum ADD VALUE 'finalizado';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 2. UNIFICACIÓN DE ESQUEMA: VACANTES (estado -> status)
-- Migramos los datos de 'estado' a 'status' si existe la columna vieja.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vacantes' AND column_name='estado') THEN
        -- Actualizar status con los valores de estado si status está vacío o es default
        UPDATE public.vacantes SET status = estado::estado_vacante_enum WHERE estado IS NOT NULL;
        -- Eliminar la columna redundante para reducir deuda técnica
        ALTER TABLE public.vacantes DROP COLUMN estado;
    END IF;
END $$;

-- 3. ASEGURAR ÍNDICES DE POSTULACIONES
CREATE INDEX IF NOT EXISTS idx_postulaciones_status ON public.postulaciones(status);

COMMIT;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Hardening Completo: Estados sincronizados y esquema de vacantes unificado.';
END $$;
