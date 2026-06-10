-- =========================================================
-- 28_fix_geo_performance.sql
-- Optimización Masiva de Consultas Espaciales (PostGIS)
-- Resuelve errores de Supabase Timeout en búsquedas y creación.
-- =========================================================

-- 1. ÍNDICE ESPACIAL (GIST) EN PERFILES
-- Vital para rpc_notify_nearby_workers (Fan-out zonal)
-- NOTA: Doble paréntesis para expresiones funcionales
CREATE INDEX IF NOT EXISTS idx_perfiles_geo_geog
    ON public.perfiles USING GIST ((ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography))
    WHERE rol = 'postulante' AND lat IS NOT NULL AND lng IS NOT NULL;

-- 2. REFACTORIZACIÓN: rpc_notify_nearby_workers (SET-BASED)
-- Eliminamos el LOOP de PL/pgSQL que era O(n) y lo convertimos en un INSERT atómico.
CREATE OR REPLACE FUNCTION public.rpc_notify_nearby_workers(
    p_vacante_id UUID,
    p_radio_km NUMERIC DEFAULT 15
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vacante public.vacantes%ROWTYPE;
    v_company_name TEXT;
BEGIN
    -- 1. Obtener la vacante y sus coordenadas
    SELECT * INTO v_vacante FROM public.vacantes WHERE id = p_vacante_id;
    
    IF NOT FOUND OR v_vacante.lat IS NULL OR v_vacante.lng IS NULL THEN
        RETURN;
    END IF;

    -- 2. Obtener el nombre de la empresa
    SELECT nombre_comercial INTO v_company_name 
    FROM public.empresas 
    WHERE id = v_vacante.empresa_id;

    -- 3. INSERT MASIVO SELECT (Usa el índice idx_perfiles_geo_geog)
    INSERT INTO public.notificaciones (user_id, tipo, reference_id, metadata)
    SELECT 
        p.id, 
        'NEW_JOB_ZONE', 
        p_vacante_id,
        jsonb_build_object(
            'jobTitle', v_vacante.titulo,
            'companyName', COALESCE(v_company_name, 'Una empresa local')
        )
    FROM public.perfiles p
    WHERE p.rol = 'postulante'
      AND p.lat IS NOT NULL 
      AND p.lng IS NOT NULL
      AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(v_vacante.lng, v_vacante.lat), 4326)::geography,
            p_radio_km * 1000
      );

END;
$$;

-- 3. RE-INDEX Y OPTIMIZACIÓN DE BÚSQUEDA DE VACANTES
-- Asegura que buscar_vacantes_cercanas use el índice correcto.
CREATE INDEX IF NOT EXISTS idx_vacantes_geo_geog
    ON public.vacantes USING GIST ((ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography))
    WHERE status = 'activa' AND lat IS NOT NULL AND lng IS NOT NULL;

CREATE OR REPLACE FUNCTION public.buscar_vacantes_cercanas(
    user_lat   DOUBLE PRECISION,
    user_lng   DOUBLE PRECISION,
    radio_km   DOUBLE PRECISION DEFAULT 15
)
RETURNS TABLE (
    id                       UUID,
    titulo                   TEXT,
    descripcion              TEXT,
    pago_monto               NUMERIC,
    tipo_turno               TEXT,
    modalidad                TEXT,
    categoria                TEXT,
    etiquetas                TEXT[],
    status                   TEXT,
    es_urgente               BOOLEAN,
    created_at               TIMESTAMPTZ,
    lat                      DOUBLE PRECISION,
    lng                      DOUBLE PRECISION,
    empresa_nombre_comercial TEXT,
    empresa_logo_url         TEXT,
    empresa_verificado       BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        v.id, v.titulo, v.descripcion, v.pago_monto, v.tipo_turno, 
        v.modalidad, v.categoria, v.etiquetas, v.status, v.es_urgente, v.created_at,
        v.lat + (random() - 0.5) * 0.09  AS lat,
        v.lng + (random() - 0.5) * 0.09  AS lng,
        e.nombre_comercial, e.logo_url, e.verificado
    FROM public.vacantes v
    LEFT JOIN public.empresas e ON e.id = v.empresa_id
    WHERE
        v.status = 'activa'
        AND v.lat IS NOT NULL
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radio_km * 1000
        )
    ORDER BY
        ST_Distance(
            ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) ASC
    LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION buscar_vacantes_cercanas TO authenticated, anon;
GRANT EXECUTE ON FUNCTION rpc_notify_nearby_workers TO authenticated, service_role;
