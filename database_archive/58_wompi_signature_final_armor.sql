-- 💎 GENERADOR DE FIRMAS WOMPI (ULTRA-BLINDADO V8)
-- Arquitectura: Single Source of Truth (SSOT)
-- Cero Deuda Técnica / Cero Código Espagueti
-- Manejo estricto de tipos para prevenir errores "unknown" en pgcrypto.

BEGIN;

-- 1. Aseguramos que la extensión de criptografía esté instalada en el schema público.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Redefinimos el RPC con validaciones estrictas y tipado fuerte.
CREATE OR REPLACE FUNCTION public.get_wompi_signature(
    p_reference text,
    p_amount_in_cents bigint,
    p_user_email text DEFAULT 'anon'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_integrity_secret text;
    v_currency text := 'COP';
    v_raw_string text;
    v_signature text;
BEGIN
    -- [SSOT]: Obtener el secreto de integridad
    SELECT TRIM(value_text) INTO v_integrity_secret 
    FROM public.company_settings 
    WHERE key_name = 'wompi_integrity_secret';

    -- [VULNERABILITY PATCH]: Prevenir "Null Silencioso"
    IF v_integrity_secret IS NULL OR v_integrity_secret = '' THEN
        RAISE EXCEPTION 'CRÍTICO: El Secreto de Integridad de Wompi no existe en company_settings.';
    END IF;

    -- [DATA INTEGRITY]: Concatenación estricta
    v_raw_string := p_reference::text || p_amount_in_cents::text || v_currency::text || v_integrity_secret::text;

    -- [SECURITY ARMOR]: Generación de Firma SHA256 
    -- Usamos digest() globalmente ya que search_path incluye 'extensions' donde Supabase instala pgcrypto
    v_signature := encode(digest(v_raw_string::text, 'sha256'::text), 'hex');

    -- Retornamos el objeto consolidado
    RETURN jsonb_build_object(
        'signature', v_signature,
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency
    );
END;
$$;

COMMIT;
