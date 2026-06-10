-- ==============================================================================
-- 🏛️ TURNES MASTER ARCHITECTURE CONSOLIDATION (VERSION 5.1 - CLEAN EDITION)
-- Objetivo: Unificar el comportamiento de los RPCs y eliminar inconsistencias.
-- ==============================================================================

BEGIN;

-- 0. 🛠️ PREPARACIÓN DEL ESQUEMA (SSOT UPGRADE)
-- Habilitamos extensiones críticas y columnas faltantes.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS plan_next_id text;

-- 1. 🚀 REPARACIÓN DEL RPC DE ARRANQUE (BOOT DATA)
-- Corrige el error de "Empresa como Array" y unifica columnas de reputación.
CREATE OR REPLACE FUNCTION public.rpc_get_user_boot_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_json jsonb;
    v_wallet_json jsonb;
BEGIN
    -- Obtenemos el perfil. 
    -- NOTA: Aunque tengas rating/calificacion, aqui priorizamos reputation_score para el frontend.
    SELECT 
        to_jsonb(p.*) || 
        jsonb_build_object('empresas', (
            SELECT to_jsonb(e.*) 
            FROM public.empresas e 
            WHERE e.id = p.id
            LIMIT 1
        ))
    INTO v_profile_json
    FROM public.perfiles p
    WHERE p.id = p_user_id;

    IF v_profile_json IS NULL THEN
        RETURN jsonb_build_object('profile', null, 'wallet', null);
    END IF;

    -- Obtener billetera
    SELECT to_jsonb(b.*) INTO v_wallet_json
    FROM public.billeteras b
    WHERE b.id = p_user_id;

    RETURN jsonb_build_object(
        'profile', v_profile_json,
        'wallet', COALESCE(v_wallet_json, jsonb_build_object('saldo', 0))
    );
END;
$$;

-- 2. 💎 REPARACIÓN DEL RPC DE PLANES
-- Gestiona cambios de plan usando las columnas de tu esquema real.
CREATE OR REPLACE FUNCTION public.rpc_change_user_plan(
    p_new_plan_id text,
    p_immediate boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_current_plan text;
    v_current_expires timestamptz;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No autorizado', 'success', false);
    END IF;

    SELECT plan, plan_expires_at INTO v_current_plan, v_current_expires
    FROM public.perfiles
    WHERE id = v_user_id;

    IF p_immediate OR v_current_plan IS NULL OR v_current_plan = 'free' OR v_current_expires < now() THEN
        UPDATE public.perfiles
        SET 
            plan = p_new_plan_id,
            plan_expires_at = CASE 
                WHEN p_new_plan_id = 'free' THEN NULL 
                ELSE now() + interval '30 days' 
            END,
            plan_next_id = NULL,
            cancel_at_period_end = false
        WHERE id = v_user_id;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Plan actualizado inmediatamente',
            'new_plan', p_new_plan_id
        );
    ELSE
        -- Cambio PROGRAMADO
        UPDATE public.perfiles
        SET 
            plan_next_id = p_new_plan_id,
            cancel_at_period_end = (p_new_plan_id = 'free' OR p_new_plan_id = 'Básico')
        WHERE id = v_user_id;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Cambio programado para el final del ciclo',
            'next_plan', p_new_plan_id,
            'expires_at', v_current_expires,
            'cancel_at_period_end', (p_new_plan_id = 'free' OR p_new_plan_id = 'Básico')
        );
    END IF;
END;
$$;

-- 3. 🛡️ REFUERZO DE SEGURIDAD EN FIRMA WOMPI
-- Repara y asegura el firmador de integridad.
CREATE OR REPLACE FUNCTION public.get_wompi_signature(
    p_reference text,
    p_amount_in_cents bigint,
    p_user_email text DEFAULT 'anon'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- 🛡️ Buscar en public y extensions
AS $$
DECLARE
    v_integrity_secret text;
    v_currency text := 'COP';
    v_raw_string text;
    v_signature text;
BEGIN
    -- 🔑 Secreto de Integridad (Sincronizado con Wompi Sandbox/Prod)
    v_integrity_secret := 'test_integrity_jUW69DbxVh248e2B4cDyVHhATTQQxGQo'; 

    -- Construcción con Castings Explícitos
    v_raw_string := p_reference::text || p_amount_in_cents::text || v_currency::text || v_integrity_secret::text;

    -- Generación de Firma con Casting Senior
    v_signature := encode(digest(v_raw_string::text, 'sha256'::text), 'hex');

    RETURN jsonb_build_object(
        'reference', p_reference,
        'amountInCents', p_amount_in_cents,
        'currency', v_currency,
        'signature', v_signature
    );
END;
$$;

-- 4. 🔐 GESTIÓN DE PERMISOS GLOBAL (LIMPIA)
-- Solo otorgamos permisos a funciones que REALMENTE existen.
GRANT EXECUTE ON FUNCTION public.rpc_get_user_boot_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_change_user_plan(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wompi_signature(text, bigint, text) TO authenticated;

COMMIT;
