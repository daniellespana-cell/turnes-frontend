-- =========================================================
-- 25_notifications_schema.sql
-- Turnes - Sistema de Notificaciones (Observer Pattern)
-- Ejecutar en Supabase SQL Editor
-- =========================================================

-- 1. CREAR TABLA (Idempotente con IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo        TEXT NOT NULL,           -- 'CHAT_MESSAGE' | 'JOB_APPLIED' | 'PAYMENT_SUCCESS' | 'MATCH_ESTABLISHED' | 'CONTRACT_SEALED' | 'RATING_RECEIVED' | 'CALL_SCHEDULED'
    leida       BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id UUID,                   -- ID de la postulación o vacante que generó la notificación
    metadata    JSONB DEFAULT '{}'::jsonb,  -- Datos contextuales del tipo de notificación (nombre, avatar, etc.)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ÍNDICES PARA QUERIES RÁPIDAS
-- Índice principal: Para listar notificaciones de un usuario ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_time
    ON public.notificaciones(user_id, created_at DESC);

-- Índice secundario: Para contar no leídas sin traer todas las filas
CREATE INDEX IF NOT EXISTS idx_notificaciones_unread
    ON public.notificaciones(user_id, leida)
    WHERE leida = FALSE;

-- 3. RLS (Row Level Security)
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Drop primero para que el script sea re-ejecutable (idempotente)
DROP POLICY IF EXISTS "User reads own notifications" ON public.notificaciones;
DROP POLICY IF EXISTS "User updates own notifications" ON public.notificaciones;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notificaciones;

-- Cada usuario solo puede leer sus propias notificaciones
CREATE POLICY "User reads own notifications"
    ON public.notificaciones FOR SELECT
    USING (auth.uid() = user_id);

-- El usuario puede marcar como leídas solo las suyas
CREATE POLICY "User updates own notifications"
    ON public.notificaciones FOR UPDATE
    USING (auth.uid() = user_id);

-- Inserción permitida via RPCs SECURITY DEFINER (no directo desde cliente)
CREATE POLICY "Service role can insert notifications"
    ON public.notificaciones FOR INSERT
    WITH CHECK (TRUE);

-- GRANTS: Sin esto, PostgreSQL ni evalúa las políticas RLS
GRANT SELECT, UPDATE ON public.notificaciones TO authenticated;
GRANT INSERT ON public.notificaciones TO service_role;

-- 4. RPC PARA INSERTAR NOTIFICACIONES (SECURITY DEFINER)
-- Se ejecuta con permisos de administrador para poderse saltar RLS al insertar
CREATE OR REPLACE FUNCTION public.rpc_create_notification(
    p_user_id    UUID,
    p_tipo       TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_metadata  JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notificaciones(user_id, tipo, reference_id, metadata)
    VALUES (p_user_id, p_tipo, p_reference_id, p_metadata)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Permiso restringido: Solo el rol de servicio (backend) puede llamar a este despachador manual
-- Los usuarios normales generarán notificaciones automáticamente vía TRIGGERS
REVOKE EXECUTE ON FUNCTION public.rpc_create_notification(UUID, TEXT, UUID, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_notification(UUID, TEXT, UUID, JSONB) TO service_role;

-- 5. HABILITAR SUPABASE REALTIME (Idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notificaciones'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;
    END IF;
END $$;

-- =========================================================
-- NOTA: Después de ejecutar este script, ve a Supabase Studio >
-- Database > Replication y verifica que `notificaciones` aparece
-- con REALTIME activado.
-- =========================================================
