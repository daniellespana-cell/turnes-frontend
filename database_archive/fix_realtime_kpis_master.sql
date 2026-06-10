-- =========================================================================
-- fix_realtime_kpis_master.sql
-- OBJETIVO: Eliminar "datos quemados" y deuda técnica en las métricas de éxito.
-- 
-- Este script:
-- 1. Crea una función SSOT para calcular éxitos.
-- 2. Refactoriza la búsqueda de talento para usar datos en tiempo real.
-- 3. Refactoriza el arranque del perfil para inyectar métricas vivas.
-- =========================================================================

BEGIN;

-- 1. 📈 FUNCIÓN MAESTRA DE ÉXITOS (Single Source of Truth)
-- Define qué constituye un "Turno Exitoso" en Turnes.
CREATE OR REPLACE FUNCTION public.fn_get_completed_shifts(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE 
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.postulaciones
    WHERE user_id = p_user_id 
    AND status IN ('finalizado', 'contratado'); -- 🔥 Estandarizado
$$;


-- 2. 🔍 REFACTOR: BÚSQUEDA DE TALENTO (buscar_talento_cercano)
-- Inyectamos el conteo en tiempo real directamente en la consulta.
CREATE OR REPLACE FUNCTION public.buscar_talento_cercano(
    user_lat double precision,
    user_lng double precision,
    radio_km double precision DEFAULT 50,
    search_query text DEFAULT ''
)
RETURNS TABLE (
    id uuid,
    nombre_display text,
    bio text,
    skills text[],
    avatar_url text,
    lat double precision,
    lng double precision,
    distancia_mts float,
    verificado boolean,
    rating numeric,
    completed_shifts int, -- Ahora es dinámico
    sector text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre_display,
        p.bio,
        p.skills,
        p.avatar_url,
        p.lat,
        p.lng,
        COALESCE(
            ST_Distance(p.geo_point, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography), 
            9999999
        ) as distancia_mts,
        p.verificado,
        p.rating,
        public.fn_get_completed_shifts(p.id) as completed_shifts, -- 🔥 LIVE CALCULATION
        p.sector
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
    AND p.id != auth.uid()
    AND (
        search_query = '' 
        OR p.nombre_display ILIKE '%' || search_query || '%'
        OR p.bio ILIKE '%' || search_query || '%'
        OR p.skills::text ILIKE '%' || search_query || '%'
    )
    AND (
        p.geo_point IS NULL 
        OR ST_DWithin(
            p.geo_point, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radio_km * 1000
        )
    )
    ORDER BY distancia_mts ASC;
END;
$$;


-- 3. 🚀 REFACTOR: CARGA DE PERFIL (rpc_get_user_boot_data)
-- Inyectamos los éxitos reales en el JSON del perfil para el Dashboard/Modal 360.
CREATE OR REPLACE FUNCTION public.rpc_get_user_boot_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile jsonb;
    v_empresas jsonb;
    v_wallet jsonb;
    v_real_shifts integer;
BEGIN
    SET LOCAL statement_timeout = '15000'; -- Optimización de latencia

    -- 1. Obtener éxitos reales
    v_real_shifts := public.fn_get_completed_shifts(p_user_id);

    -- 2. Obtener datos de perfil e inyectar métrica viva (Blindaje contra Nulos)
    SELECT 
        to_jsonb(p) || jsonb_build_object('completed_shifts', COALESCE(v_real_shifts, 0))
    INTO v_profile
    FROM public.perfiles p
    WHERE p.id = p_user_id;

    IF v_profile IS NULL THEN
        RETURN jsonb_build_object(
            'profile', jsonb_build_object('id', p_user_id, 'completed_shifts', 0), 
            'wallet', jsonb_build_object('id', p_user_id, 'saldo', 0)
        );
    END IF;

    -- 3. Adjuntar empresas (JOIN 1:1)
    SELECT to_jsonb(e) INTO v_empresas
    FROM public.empresas e
    WHERE e.id = p_user_id;

    IF v_empresas IS NOT NULL THEN
        v_profile := v_profile || jsonb_build_object('empresas', jsonb_build_array(v_empresas));
    ELSE
        v_profile := v_profile || jsonb_build_object('empresas', '[]'::jsonb);
    END IF;

    -- 4. Obtener Billetera
    SELECT to_jsonb(b) INTO v_wallet
    FROM public.billeteras b
    WHERE b.id = p_user_id;

    IF v_wallet IS NULL THEN
        v_wallet := jsonb_build_object('id', p_user_id, 'saldo', 0);
    END IF;

    RETURN jsonb_build_object(
        'profile', v_profile,
        'wallet', v_wallet
    );
END;
$$;

COMMIT;

-- =========================================================================
-- NOTA: Con esto, la columna 'completed_shifts' de la tabla 'perfiles'
-- queda obsoleta. Los datos son ahora 100% veraces y en tiempo real.
-- =========================================================================
