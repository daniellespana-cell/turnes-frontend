-- 🔐 ACTUALIZACIÓN DE INTEGRIDAD REAL (STAFF LEVEL)
BEGIN;

-- 1. Inyectamos TU SECRETO REAL en la tabla de configuración
-- Esto asegura que el backend firme con la llave correcta de tu cuenta Wompi.
INSERT INTO public.company_settings (key_name, value_text, description)
VALUES (
    'wompi_integrity_secret', 
    'test_integrity_ophHNrXukufhM1mExOh5oTLuKBGuRK0t', 
    'Secreto de integridad SHA256 Real para Wompi'
)
ON CONFLICT (key_name) DO UPDATE 
SET value_text = EXCLUDED.value_text, updated_at = now();

-- 2. Redefinición del RPC (Blindaje Final)
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
BEGIN
    -- Obtenemos el secreto real que acabamos de insertar
    SELECT TRIM(value_text) INTO v_integrity_secret 
    FROM public.company_settings 
    WHERE key_name = 'wompi_integrity_secret';

    -- Construcción exacta según estándar Wompi
    v_raw_string := p_reference::text || p_amount_in_cents::text || v_currency::text || v_integrity_secret::text;

    -- Generación de Firma
    v_signature := encode(digest(v_raw_string, 'sha256'), 'hex');

    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;

COMMIT;
