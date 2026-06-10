-- 🔐 CONFIGURACIÓN DE INTEGRIDAD FINANCIERA (PRODUCTION READY)
BEGIN;

-- 1. Insertamos o actualizamos el secreto en la tabla de configuración
-- Reemplaza el valor con tu secreto real de Wompi (Sandbox o Producción)
INSERT INTO public.company_settings (key_name, value_text, description)
VALUES (
    'wompi_integrity_secret', 
    'test_integrity_jUW69DbxVh248e2B4cDyVHhATTQQxGQo', 
    'Secreto de integridad SHA256 para validación de transacciones Wompi'
)
ON CONFLICT (key_name) DO UPDATE 
SET value_text = EXCLUDED.value_text, updated_at = now();

-- 2. Redefinimos el RPC para que sea DINÁMICO y use la configuración
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
    -- 🚀 BUSQUEDA DINÁMICA DEL SECRETO (SSOT)
    SELECT value_text INTO v_integrity_secret 
    FROM public.company_settings 
    WHERE key_name = 'wompi_integrity_secret';

    -- Fallback de seguridad (solo para desarrollo)
    IF v_integrity_secret IS NULL THEN
        v_integrity_secret := 'test_integrity_jUW69DbxVh248e2B4cDyVHhATTQQxGQo';
    END IF;

    -- Construcción de cadena según estándar Wompi
    v_raw_string := p_reference::text || p_amount_in_cents::text || v_currency::text || v_integrity_secret::text;

    -- Generación de Firma SHA256
    v_signature := encode(digest(v_raw_string::text, 'sha256'::text), 'hex');

    -- Log de auditoría interna
    INSERT INTO public.system_logs (level, component, message, metadata)
    VALUES ('INFO', 'FINANCE_SIGNER', 'Firma generada via SSOT', jsonb_build_object('ref', p_reference, 'amount', p_amount_in_cents));

    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;

COMMIT;
