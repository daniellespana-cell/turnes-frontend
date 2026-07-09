-- =========================================================================
-- 32_webhook_anti_spam_v1.sql
-- OBJETIVO: Resolver Deuda Técnica (N+1, Spam, PII Leak)
-- =========================================================================

BEGIN;

-- 1. 🛡️ SINGLE SOURCE OF TRUTH: Tabla de Historial Anti-Spam
CREATE TABLE IF NOT EXISTS public.historial_notificaciones_vacantes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vacante_id uuid REFERENCES public.vacantes(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    -- Evitar que la base de datos guarde duplicados de la misma vacante exacta
    CONSTRAINT uk_candidato_vacante UNIQUE (candidato_id, vacante_id)
);

-- Índices de alto rendimiento para que el filtro de "6 horas" vuele
CREATE INDEX IF NOT EXISTS idx_historial_noti_candidato ON public.historial_notificaciones_vacantes(candidato_id, created_at);

-- 2. 🔐 RPC SEGURA (Solo para el Webhook Robot)
DROP FUNCTION IF EXISTS public.rpc_get_webhook_candidates(double precision, double precision, double precision, text, integer);

CREATE OR REPLACE FUNCTION public.rpc_get_webhook_candidates(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 5,
    search_query text DEFAULT '',
    horas_spam integer DEFAULT 6
)
RETURNS TABLE (
    id uuid,
    nombre_display text,
    email text, -- ⚠️ Dato Sensible (PII)
    distancia_mts float
) 
LANGUAGE plpgsql
-- SECURITY DEFINER es necesario para leer auth.users
SECURITY DEFINER
AS $$
BEGIN
    -- 🛑 CRÍTICO: Evitar Filtración de Datos (PII)
    -- Si el usuario actual NO es el service_role (Robot), bloqueamos la ejecución.
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' AND auth.uid() IS NOT NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only service_role can access candidate emails.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.nombre_display,
        au.email::text,
        ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) as distancia_mts
    FROM public.perfiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.rol = 'postulante'
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
        OR p.sector ILIKE '%' || search_query || '%'
    )
    AND p.geo_point IS NOT NULL 
    AND ST_DWithin(
        p.geo_point, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radio_km * 1000
    )
    -- 🛡️ ESCUDO ANTI-SPAM (No ha recibido correos en las últimas X horas)
    AND NOT EXISTS (
        SELECT 1 
        FROM public.historial_notificaciones_vacantes h
        WHERE h.candidato_id = p.id
        AND h.created_at > now() - (horas_spam || ' hours')::interval
    )
    ORDER BY distancia_mts ASC
    LIMIT 100; -- Protección estricta de Batch (Máximo 100 correos a la vez para Resend)
END;
$$;

-- 3. 🚫 CERRAR LA BRECHA DE SEGURIDAD (Capa PostgREST)
REVOKE EXECUTE ON FUNCTION public.rpc_get_webhook_candidates(double precision, double precision, double precision, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_webhook_candidates(double precision, double precision, double precision, text, integer) TO service_role;

-- 4. 📝 RPC PARA REGISTRAR LOGS EN BATCH
CREATE OR REPLACE FUNCTION public.rpc_log_batch_notifications(
    p_vacante_id uuid,
    p_candidato_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.historial_notificaciones_vacantes (candidato_id, vacante_id)
    SELECT unnest(p_candidato_ids), p_vacante_id
    ON CONFLICT (candidato_id, vacante_id) DO NOTHING;
END;
$$;

-- REVOKE A TODOS MENOS SERVICE_ROLE
REVOKE EXECUTE ON FUNCTION public.rpc_log_batch_notifications(uuid, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_log_batch_notifications(uuid, uuid[]) TO service_role;

COMMIT;

-- Refrescar caché
NOTIFY pgrst, 'reload schema';
