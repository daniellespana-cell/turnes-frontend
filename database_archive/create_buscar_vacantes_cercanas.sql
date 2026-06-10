-- 🗺️ PostGIS RPC: buscar_vacantes_cercanas v2 (Production)
-- Ejecutar en Supabase SQL Editor.
-- Requiere la extensión PostGIS activada (Settings > Extensions > PostGIS).
-- CAMBIOS v2:
--   - Coordenadas fuzzed (±0.05°, ~5km) antes de responder al cliente (Privacy Shield)
--   - JOIN con empresas inline (evita petición extra desde el hook)
--   - RETURNS TABLE explícito (mejor tipado y seguridad)
--   - LIMIT 100 (previene dumps accidentales de toda la tabla)

DROP FUNCTION IF EXISTS buscar_vacantes_cercanas(double precision, double precision, double precision) CASCADE;

CREATE OR REPLACE FUNCTION buscar_vacantes_cercanas(
    user_lat   DOUBLE PRECISION,
    user_lng   DOUBLE PRECISION,
    radio_km   DOUBLE PRECISION DEFAULT 15
)
RETURNS TABLE (
    id                       UUID,
    empresa_id               UUID,
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
    fecha_turno              TIMESTAMPTZ,
    lat                      DOUBLE PRECISION,  -- 🔒 fuzzed
    lng                      DOUBLE PRECISION,  -- 🔒 fuzzed
    empresa_nombre_comercial TEXT,
    empresa_logo_url         TEXT,
    empresa_verificado       BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        v.id,
        v.empresa_id,
        v.titulo,
        v.descripcion,
        v.pago_monto,
        v.tipo_turno,
        v.modalidad,
        v.categoria,
        v.etiquetas,
        v.status,
        v.es_urgente,
        v.created_at,
        v.fecha_turno,

        -- 🔒 Privacy Shield — mismo offset que fuzzLocation() en vacancyService.js
        -- ±0.05° ≈ ±5km: el postulante ve el área, no la dirección exacta
        v.lat + (random() - 0.5) * 0.09  AS lat,
        v.lng + (random() - 0.5) * 0.09  AS lng,

        e.nombre_comercial  AS empresa_nombre_comercial,
        e.logo_url          AS empresa_logo_url,
        e.verificado        AS empresa_verificado

    FROM vacantes v
    LEFT JOIN empresas e ON e.id = v.empresa_id

    WHERE
        v.status  = 'activa'
        AND v.lat IS NOT NULL
        AND v.lng IS NOT NULL
        AND ST_DWithin(
            ST_MakePoint(v.lng, v.lat)::geography,
            ST_MakePoint(user_lng, user_lat)::geography,
            radio_km * 1000
        )

    ORDER BY
        ST_Distance(
            ST_MakePoint(v.lng, v.lat)::geography,
            ST_MakePoint(user_lng, user_lat)::geography
        ) ASC

    LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION buscar_vacantes_cercanas TO authenticated, anon;

CREATE INDEX IF NOT EXISTS idx_vacantes_geo
    ON vacantes USING GIST (ST_MakePoint(lng, lat));
