-- ==============================================================================
-- 🛡️ WOMPI SECURE SIGNATURE & LOGGING SYSTEM
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New Query
-- 2. Copia y pega TODO este contenido.
-- 3. Reemplaza 'TU_SECRETO_DE_INTEGRIDAD_AQUI' en la línea 35 con tu secreto real.
-- 4. Dale Run.

-- 1. Habilitar extensión de Criptografía (si no existe)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear Tabla de Logs (Para ver qué está pasando desde el Dashboard)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    level TEXT CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
    component TEXT,
    message TEXT,
    metadata JSONB
);

-- Habilitar RLS (Seguridad) para Logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Política removida para seguridad.

-- 3. Función Segura para Generar Firma (RPC)
-- Esta función vive en el servidor. El navegador NUNCA ve el secreto.
CREATE OR REPLACE FUNCTION get_wompi_signature(
    p_reference TEXT,
    p_amount_in_cents BIGINT,
    p_user_email TEXT DEFAULT 'anon'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de admin (para leer secreto si estuviera en vault)
AS $$
DECLARE
    v_integrity_secret TEXT;
    v_currency TEXT := 'COP';
    v_raw_string TEXT;
    v_signature TEXT;
BEGIN
    -- 🔑 CONFIGURACIÓN: PEGA TU SECRETO AQUÍ
    -- (Es mucho más seguro tenerlo aquí que en el navegador)
    v_integrity_secret := 'test_integrity_jUW69DbxVh248e2B4cDyVHhATTQQxGQo'; -- <--- REEMPLAZA ESTO

    -- Construir la cadena: Reference + Amount + Currency + Secret
    v_raw_string := p_reference || p_amount_in_cents::TEXT || v_currency || v_integrity_secret;

    -- Generar Hash SHA-256 (Hexadecimal)
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    -- 📝 Loguear el intento (Para que puedas verlo en la tabla system_logs)
    INSERT INTO system_logs (level, component, message, metadata)
    VALUES (
        'INFO', 
        'WOMPI_SIGNER', 
        'Firma generada exitosamente', 
        jsonb_build_object(
            'reference', p_reference,
            'amount', p_amount_in_cents,
            'user', p_user_email,
            'generated_signature', v_signature
        )
    );

    -- Retornar objeto listo para usar
    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;
