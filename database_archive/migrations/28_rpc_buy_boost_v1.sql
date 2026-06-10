-- 🛠️ 28_rpc_buy_boost_v1.sql
-- OBJETIVO: Compra de Impulso Urgente (48H) con validación de saldo.

BEGIN;

-- 1. AGREGAR COLUMNA DE EXPIRACIÓN SI NO EXISTE
ALTER TABLE public.vacantes 
ADD COLUMN IF NOT EXISTS urgente_expiracion timestamptz;

-- 2. FUNCIÓN RPC ATÓMICA
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
BEGIN
    v_user_id := auth.uid();

    -- A. Verificar propiedad de la vacante y obtener título
    SELECT titulo INTO v_vacancy_title
    FROM public.vacantes
    WHERE id = p_vacancy_id AND empresa_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED: No tienes permisos sobre esta vacante.';
    END IF;

    -- B. Verificar saldo (desde el perfil/empresa)
    SELECT saldo INTO v_current_balance
    FROM public.perfiles
    WHERE id = v_user_id;

    IF v_current_balance < p_price THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Tu saldo es insuficiente ($%)', v_current_balance;
    END IF;

    -- C. DEBITAR SALDO
    UPDATE public.perfiles
    SET saldo = saldo - p_price,
        updated_at = now()
    WHERE id = v_user_id;

    -- D. ACTIVAR IMPULSO (48 HORAS)
    UPDATE public.vacantes
    SET es_urgente = true,
        urgente_expiracion = now() + interval '48 hours',
        updated_at = now()
    WHERE id = p_vacancy_id;

    -- E. REGISTRAR TRANSACCIÓN (Opcional, si tienes tabla de logs financieros)
    -- INSERT INTO logs_financieros ...

    RETURN jsonb_build_object(
        'success', true,
        'vacancyTitle', v_vacancy_title,
        'newBalance', v_current_balance - p_price,
        'expiration', now() + interval '48 hours'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_buy_boost_v1(uuid, numeric) TO authenticated;

COMMIT;
