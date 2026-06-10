-- ==============================================================================
-- 🐞 WOMPI DEBUGGER: UPDATE DE LA FUNCIÓN DE FIRMA
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
    -- 🔑 TU SECRETO DE INTEGRIDAD (Verifica que sea el mismo de tu Dashboard Wompi Sandbox)
    -- Asegúrate de que NO tenga espacios al final
    v_integrity_secret := 'test_integrity_ophHNrXukufhM1mExOh5oTLuKBGuRK0t'; 

    -- Construir la cadena: Reference + Amount + Currency + Secret
    -- IMPORTANTE: El orden es estricto.
    v_raw_string := p_reference || p_amount_in_cents::TEXT || v_currency || v_integrity_secret;

    -- Generar Hash SHA-256 (Hexadecimal)
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    -- 📝 LOG DE DEPURACIÓN (Mira la tabla system_logs después de intentar pagar)
    INSERT INTO system_logs (level, component, message, metadata)
    VALUES (
        'DEBUG', 
        'WOMPI_DEBUGGER', 
        'Detalle de Firma Generada', 
        jsonb_build_object(
            'reference', p_reference,
            'amount', p_amount_in_cents,
            'currency', v_currency,
            'secret_used', v_integrity_secret,
            'CONCATENATED_STRING', v_raw_string, -- <--- ESTO ES LO QUE DEBES VERIFICAR
            'GENERATED_HASH', v_signature
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

-- Permisos
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO service_role;
GRANT EXECUTE ON FUNCTION get_wompi_signature(text, bigint, text) TO anon;
