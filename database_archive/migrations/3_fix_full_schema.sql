
-- 🛠️ 3_fix_full_schema.sql
-- Script consolidado para reparar TODO el ecosistema de Vacantes y Postulaciones.
-- Ejecuta esto para asegurar que tienes las columnas y tablas correctas.

BEGIN; -- Iniciar Transacción

-- 1. ENUMS (Si no existen)
DO $$ BEGIN
    CREATE TYPE estado_vacante_enum AS ENUM ('activa', 'cerrada', 'expirada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_postulacion_enum AS ENUM ('pendiente', 'rechazado', 'chat_iniciado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. UPDATE TABLE: VACANTES
-- Aseguramos que tenga las columnas necesarias para el dashboard y mapa
ALTER TABLE vacantes ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE vacantes ADD COLUMN IF NOT EXISTS lng double precision;
ALTER TABLE vacantes ADD COLUMN IF NOT EXISTS status estado_vacante_enum DEFAULT 'activa';
ALTER TABLE vacantes ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- 3. RESET TABLE: POSTULACIONES
-- Borramos y recreamos para evitar conflictos de "column user_id does not exist"
DROP TABLE IF EXISTS postulaciones CASCADE;

CREATE TABLE postulaciones (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacante_id uuid REFERENCES vacantes(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status estado_postulacion_enum DEFAULT 'pendiente',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(vacante_id, user_id)
);

-- 4. SEGURIDAD RLS (Row Level Security)
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

-- Postulantes ven lo suyo
CREATE POLICY "Applicants view own" ON postulaciones
    FOR SELECT USING (auth.uid() = user_id);

-- Empresas ven postulaciones de SUS vacantes
CREATE POLICY "Companies view applications for their vacancies" ON postulaciones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vacantes
            WHERE vacantes.id = postulaciones.vacante_id
            AND vacantes.empresa_id = auth.uid()
        )
    );

-- Usuarios pueden postularse
CREATE POLICY "Users can apply" ON postulaciones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Empresas cambian status
CREATE POLICY "Companies update status" ON postulaciones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vacantes
            WHERE vacantes.id = postulaciones.vacante_id
            AND vacantes.empresa_id = auth.uid()
        )
    );

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_postulaciones_vacante ON postulaciones(vacante_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_user ON postulaciones(user_id);

COMMIT; -- Confirmar cambios
