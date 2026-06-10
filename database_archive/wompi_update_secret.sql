-- ==============================================================================
-- 🔑 ACTUALIZACIÓN DE SECRETO WOMPI (SYNC)
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a Supabase > SQL Editor > New Query
-- 2. Copia y pega esto.
-- 3. Dale Run.

CREATE OR REPLACE FUNCTION get_wompi_signature(
    p_reference TEXT,
    p_amount_in_cents BIGINT,
    p_user_email TEXT DEFAULT 'anon'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_integrity_secret TEXT;
    v_currency TEXT := 'COP';
    v_raw_string TEXT;
    v_signature TEXT;
BEGIN
    -- 🔑 SECRETO ACTUALIZADO (Sincronizado con tu .env.local)
    v_integrity_secret := 'test_integrity_ophHNrXukufhM1mExOh5oTLuKBGuRK0t'; -- <--- ESTA ES LA NUEVA CLAVE

    -- Construir la cadena: Reference + Amount + Currency + Secret
    v_raw_string := p_reference || p_amount_in_cents::TEXT || v_currency || v_integrity_secret;

    -- Generar Hash SHA-256 (Hexadecimal)
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    -- 📝 Loguear el intento
    INSERT INTO system_logs (level, component, message, metadata)
    VALUES (
        'INFO', 
        'WOMPI_SIGNER', 
        'Firma generada con NUEVO secreto', 
        jsonb_build_object(
            'reference', p_reference,
            'amount', p_amount_in_cents,
            'signature_first_chars', substring(v_signature from 1 for 6)
        )
    );

    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;

-- Asegurar permisos de nuevo (por si al reemplazar se pierden)
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO service_role;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO anon;
