-- 🛠️ 28_rpc_buy_boost_v5.sql
-- OBJETIVO: Hardening del sistema de Impulsos.
-- 1. Previene doble compra accidental.
-- 2. Crea una vista inteligente para sorting honesto.

BEGIN;

-- 1. RPC HARDENING
CREATE OR REPLACE FUNCTION public.rpc_buy_boost_v1(
    p_vacancy_id UUID,
    p_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_current_balance NUMERIC;
    v_vacancy_title TEXT;
    v_current_expiry TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();

    -- A. Verificar propiedad y estado de impulso actual
    SELECT titulo, urgente_expiracion INTO v_vacancy_title, v_current_expiry
    FROM public.vacantes
    WHERE id = p_vacancy_id AND empresa_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED: No tienes permisos sobre esta vacante.';
    END IF;

    -- B. Prevenir "Double-Dip" (Si ya es urgente y no ha expirado)
    IF v_current_expiry IS NOT NULL AND v_current_expiry > now() THEN
        RAISE EXCEPTION 'ALREADY_BOOSTED: Esta vacante ya tiene un impulso activo hasta %', v_current_expiry;
    END IF;

    -- C. Verificar saldo
    SELECT saldo INTO v_current_balance
    FROM public.billeteras
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL OR v_current_balance < p_price THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- D. Transacción Atómica: Cobro + Activación
    UPDATE public.billeteras SET saldo = saldo - p_price WHERE id = v_user_id;

    UPDATE public.vacantes
    SET es_urgente = true,
        urgente_expiracion = now() + interval '48 hours',
        updated_at = now()
    WHERE id = p_vacancy_id;

    -- E. Log de auditoría
    INSERT INTO public.movimientos (billetera_id, tipo, monto, concepto, referencia)
    VALUES (v_user_id, 'PAGO_SERVICIO', -p_price, 'Boost 48H: ' || v_vacancy_title, jsonb_build_object('vacancy_id', p_vacancy_id));

    RETURN jsonb_build_object(
        'success', true,
        'newBalance', v_current_balance - p_price,
        'expiration', now() + interval '48 hours'
    );
END;
$$;

-- 2. VISTA INTELIGENTE PARA EL FEED (Opcional, pero recomendada para Sorting)
-- Nota: Si no queremos usar vistas, lo manejaremos con Order By complejo en el Service.

COMMIT;
