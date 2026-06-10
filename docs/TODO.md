# Chat Repair Protocol Implementation Plan

## A. Centralize Identity in ChatPage.jsx
- [x] Modify candidate lookup to prioritize URL ID parameter
- [x] Remove dependency on location.state as primary source
- [x] Ensure minimal candidate object with ID is passed when no full candidate is found

## B. Correct Permission Logic in useChatPermissions.js
- [x] Change default behavior to return `isClosed: false` unless explicitly `estadoTurno === 'FINALIZADO'`
- [x] Ensure any other state returns `isClosed: false`

## C. Clean up UI in MessageList.jsx
- [x] Remove conditional rendering of "Ciclo Finalizado" banner based on error states
- [x] Ensure banner only appears when `isClosed` is true

## D. Fix useChatLogic.js
- [x] Correct the mapping of permissions to UI state
-- SCRIPT DE BASE DE DATOS: TURNES (V4 - MASTER PRODUCCIÓN)
-- ==========================================================

-- 1. EXTENSIONES DE RENDIMIENTO Y UTILIDAD
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Búsquedas fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Índices JSONB avanzados

-- 2. TIPOS ENUM (Enumeradores)
CREATE TYPE tipo_usuario_enum AS ENUM ('postulante', 'empresa', 'admin');
CREATE TYPE estado_cuenta_enum AS ENUM ('activo', 'inactivo', 'suspendido', 'bloqueado');
CREATE TYPE kyc_estado_enum AS ENUM ('no_enviado', 'pendiente', 'aprobado', 'rechazado');
CREATE TYPE tipo_salario_enum AS ENUM ('por_hora', 'total', 'negociable');
CREATE TYPE estado_turno_enum AS ENUM ('borrador', 'publicado', 'en_curso', 'completado', 'cancelado');
CREATE TYPE estado_postulacion_enum AS ENUM ('pendiente', 'aceptada', 'rechazada', 'retirada', 'seleccionado_para_turno', 'completado');
CREATE TYPE estado_pago_enum AS ENUM ('pre_autorizado', 'capturado', 'disputa_activa', 'reembolsado', 'fallido');
CREATE TYPE estado_disputa_enum AS ENUM ('abierta', 'en_negociacion', 'en_arbitraje', 'resuelta_acuerdo', 'resuelta_turnes', 'cerrada');
CREATE TYPE tipo_documento_kyc_enum AS ENUM ('cedula_frontal', 'cedula_reverso', 'selfie', 'rut', 'camara_comercio', 'otro');

-- 3. TABLAS PRINCIPALES

-- Tabla: Usuarios
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario tipo_usuario_enum NOT NULL,
    nombre_completo VARCHAR(255),
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    estado_cuenta estado_cuenta_enum NOT NULL DEFAULT 'activo',
    kyc_estado kyc_estado_enum NOT NULL DEFAULT 'no_enviado'
);

-- Índices Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo_usuario ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_estado ON usuarios(estado_cuenta);

-- Tabla: Documentos KYC
CREATE TABLE documentos_kyc (
    id_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    tipo_documento tipo_documento_kyc_enum NOT NULL,
    url_archivo VARCHAR(500) NOT NULL,
    estado_validacion kyc_estado_enum NOT NULL DEFAULT 'pendiente',
    comentarios_admin TEXT,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP
);
CREATE INDEX idx_kyc_usuario ON documentos_kyc(id_usuario);

-- Tabla: Perfiles de Postulantes
CREATE TABLE perfiles_postulantes (
    id_postulante UUID PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    bio TEXT,
    habilidades JSONB, 
    experiencia_laboral JSONB,
    disponibilidad JSONB,
    calificacion_promedio DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (calificacion_promedio >= 0 AND calificacion_promedio <= 5),
    balance_disponible DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (balance_disponible >= 0)
);
-- Índice GIN para habilidades (Búsqueda rápida en JSON)
CREATE INDEX idx_postulantes_habilidades ON perfiles_postulantes USING GIN (habilidades);

-- Tabla: Perfiles de Empresas
CREATE TABLE perfiles_empresas (
    id_empresa UUID PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_comercial VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    rfc_cif_taxid VARCHAR(50) UNIQUE,
    direccion_fiscal VARCHAR(255),
    sector VARCHAR(100),
    persona_contacto VARCHAR(255),
    telefono_contacto VARCHAR(20),
    calificacion_promedio DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (calificacion_promedio >= 0 AND calificacion_promedio <= 5)
);
CREATE INDEX idx_empresas_sector ON perfiles_empresas(sector);

-- Tabla: Turnos (Ofertas)
CREATE TABLE turnos (
    id_turno UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empresa UUID NOT NULL REFERENCES perfiles_empresas(id_empresa) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion_lat DECIMAL(9,6) NOT NULL,
    ubicacion_lng DECIMAL(9,6) NOT NULL,
    ubicacion_texto VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    salario DECIMAL(10,2) NOT NULL CHECK (salario >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'COP',
    tipo_salario tipo_salario_enum NOT NULL,
    habilidades_requeridas JSONB,
    num_postulantes_requeridos INTEGER NOT NULL DEFAULT 1 CHECK (num_postulantes_requeridos > 0),
    estado_turno estado_turno_enum NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_turno CHECK (fecha_fin > fecha_inicio)
);

-- Índices Turnos
CREATE INDEX idx_turnos_empresa_estado ON turnos(id_empresa, estado_turno);
CREATE INDEX idx_turnos_fecha_inicio ON turnos(fecha_inicio);
CREATE INDEX idx_turnos_estado ON turnos(estado_turno);
CREATE INDEX idx_turnos_geo ON turnos(ubicacion_lat, ubicacion_lng);
-- Índice Full Text Search para Título y Descripción
CREATE INDEX idx_turnos_titulo_desc ON turnos USING GIN (to_tsvector('spanish', titulo || ' ' || coalesce(descripcion, '')));

-- Tabla: Postulaciones
CREATE TABLE postulaciones (
    id_postulacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_turno UUID NOT NULL REFERENCES turnos(id_turno) ON DELETE CASCADE,
    id_postulante UUID NOT NULL REFERENCES perfiles_postulantes(id_postulante) ON DELETE CASCADE,
    estado_postulacion estado_postulacion_enum NOT NULL DEFAULT 'pendiente',
    fecha_postulacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_turno, id_postulante)
);
CREATE INDEX idx_postulaciones_postulante ON postulaciones(id_postulante, estado_postulacion);

-- Tabla: Pagos de Turnos
-- ON DELETE SET NULL: Mantiene el registro financiero "huérfano" si el usuario se borra.
CREATE TABLE pagos_turnos (
    id_pago_turno UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_turno UUID REFERENCES turnos(id_turno) ON DELETE SET NULL, 
    id_empresa UUID REFERENCES perfiles_empresas(id_empresa) ON DELETE SET NULL, 
    id_postulante UUID REFERENCES perfiles_postulantes(id_postulante) ON DELETE SET NULL, 
    monto_bruto_turno DECIMAL(10,2) NOT NULL CHECK (monto_bruto_turno >= 0),
    comision_turnes DECIMAL(10,2) NOT NULL CHECK (comision_turnes >= 0),
    monto_total_empresa DECIMAL(10,2) NOT NULL CHECK (monto_total_empresa >= 0),
    moneda VARCHAR(3) NOT NULL,
    estado_pago estado_pago_enum NOT NULL DEFAULT 'pre_autorizado',
    id_pre_autorizacion_psp VARCHAR(255) NOT NULL UNIQUE,
    id_captura_psp VARCHAR(255),
    fecha_pre_autorizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_captura TIMESTAMP
);
CREATE INDEX idx_pagos_estado ON pagos_turnos(estado_pago);

-- Tabla: Calificaciones
CREATE TABLE calificaciones (
    id_calificacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_turno UUID REFERENCES turnos(id_turno) ON DELETE SET NULL, 
    id_autor UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    id_destinatario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha_calificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Disputas
CREATE TABLE disputas (
    id_disputa UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_pago_turno UUID NOT NULL UNIQUE REFERENCES pagos_turnos(id_pago_turno) ON DELETE RESTRICT,
    id_iniciador UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_disputa estado_disputa_enum NOT NULL DEFAULT 'abierta',
    descripcion TEXT NOT NULL,
    evidencia_iniciador JSONB,
    decision_turnes TEXT,
    monto_liberado_postulante DECIMAL(10,2),
    monto_reembolsado_empresa DECIMAL(10,2),
    fecha_resolucion TIMESTAMP
);

-- 4. TABLA DE AUDITORÍA PARTICIONADA
CREATE TABLE logs_auditoria (
    id_log UUID DEFAULT uuid_generate_v4(),
    id_usuario UUID,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    id_registro_afectado UUID,
    detalles_json JSONB,
    ip_origen VARCHAR(45),
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (fecha_evento);

-- Particiones iniciales (Ajustar fechas según lanzamiento)
CREATE TABLE logs_auditoria_2025 PARTITION OF logs_auditoria
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE logs_auditoria_2026 PARTITION OF logs_auditoria
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE INDEX idx_audit_fecha ON logs_auditoria(fecha_evento);
CREATE INDEX idx_audit_usuario ON logs_auditoria(id_usuario);

-- 5. VISTAS MATERIALIZADAS (Analytics)

-- Vista: Métricas Empresa
CREATE MATERIALIZED VIEW mv_metricas_empresa AS
SELECT 
    p.id_empresa,
    COUNT(t.id_turno) as total_turnos_publicados,
    COUNT(pt.id_pago_turno) as total_pagos_realizados,
    COALESCE(SUM(pt.monto_total_empresa), 0) as total_gastado
FROM perfiles_empresas p
LEFT JOIN turnos t ON p.id_empresa = t.id_empresa
LEFT JOIN pagos_turnos pt ON p.id_empresa = pt.id_empresa AND pt.estado_pago = 'capturado'
GROUP BY p.id_empresa
WITH DATA;

CREATE UNIQUE INDEX idx_mv_metricas_empresa ON mv_metricas_empresa(id_empresa);

-- Vista: Estadísticas Postulante
CREATE MATERIALIZED VIEW mv_estadisticas_postulante AS
SELECT 
    p.id_postulante,
    COUNT(pos.id_postulacion) FILTER (WHERE pos.estado_postulacion = 'completado') as turnos_completados,
    p.calificacion_promedio as rating_actual,
    p.balance_disponible as saldo_actual
FROM perfiles_postulantes p
LEFT JOIN postulaciones pos ON p.id_postulante = pos.id_postulante
GROUP BY p.id_postulante, p.calificacion_promedio, p.balance_disponible
WITH DATA;

CREATE UNIQUE INDEX idx_mv_estadisticas_postulante ON mv_estadisticas_postulante(id_postulante);

-- 6. TRIGGERS Y FUNCIONES

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_turnos_modtime BEFORE UPDATE ON turnos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_postulaciones_modtime BEFORE UPDATE ON postulaciones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para refrescar vistas (llamar periódicamente)
CREATE OR REPLACE FUNCTION refresh_mat_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metricas_empresa;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estadisticas_postulante;
END;
$$ LANGUAGE plpgsql; 