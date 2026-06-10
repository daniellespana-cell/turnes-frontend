-- 🛡️ WOMPI INTEGRITY ARMOR (PRODUCTION VERSION)
BEGIN;

-- 1. Limpieza y normalización del secreto en la base de datos
UPDATE public.company_settings 
SET value_text = TRIM(value_text)
WHERE key_name = 'wompi_integrity_secret';

-- 2. Redefinición del RPC con blindaje de tipos y limpieza de strings
CREATE OR REPLACE FUNCTION public.get_wompi_signature(
    p_reference text,
    p_amount_in_cents bigint,
    p_user_email text DEFAULT 'anon'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_integrity_secret text;
    v_currency text := 'COP';
    v_raw_string text;
    v_signature text;
    v_clean_ref text;
BEGIN
    -- 🚀 1. Limpieza de entrada
    v_clean_ref := TRIM(p_reference);

    -- 🚀 2. Búsqueda y limpieza del secreto
    SELECT TRIM(value_text) INTO v_integrity_secret 
    FROM public.company_settings 
    WHERE key_name = 'wompi_integrity_secret';

    -- Fallback preventivo
    IF v_integrity_secret IS NULL THEN
        v_integrity_secret := 'test_integrity_jUW69DbxVh248e2B4cDyVHhATTQQxGQo';
    END IF;

    -- 🚀 3. Construcción Blindada (Concatenación SSOT Wompi)
    -- Importante: El monto debe ir como texto plano sin separadores ni espacios.
    v_raw_string := v_clean_ref || p_amount_in_cents::text || v_currency || v_integrity_secret;

    -- 🚀 4. Generación de Firma SHA256 (Hexadecimal Lowercase)
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    -- 🚀 5. Auditoría Interna (Staff Level)
    -- Logueamos la construcción (ocultando el secreto por seguridad)
    INSERT INTO public.system_logs (level, component, message, metadata)
    VALUES (
        'DEBUG', 
        'WOMPI_SIGNER', 
        'Firma generada exitosamente', 
        jsonb_build_object(
            'ref_final', v_clean_ref,
            'amount', p_amount_in_cents,
            'string_pattern', v_clean_ref || p_amount_in_cents::text || v_currency || '***'
        )
    );

    RETURN jsonb_build_object(
        'reference', v_clean_ref,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;

COMMIT;
