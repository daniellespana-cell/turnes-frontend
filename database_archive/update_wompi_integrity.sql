-- 🔑 ACTUALIZACIÓN DE SECRETO DE INTEGRIDAD (Wompi Test)
-- Este script actualiza la función de firma para usar tu NUEVO secreto de pruebas.

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

    v_integrity_secret := 'test_integrity_ophHNrXukufhM1mExOh5oTLuKBGuRK0t'; 

    -- Construir la cadena: Reference + Amount + Currency + Secret
    v_raw_string := p_reference || p_amount_in_cents::TEXT || v_currency || v_integrity_secret;

    -- Generar Hash SHA-256 (Hexadecimal)
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    -- Loguear para debug
    INSERT INTO system_logs (level, component, message, metadata)
    VALUES (
        'INFO', 
        'WOMPI_SIGNER', 
        'Firma generada (Nueva Clave)', 
        jsonb_build_object('ref', p_reference, 'amt', p_amount_in_cents)
    );

    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;
