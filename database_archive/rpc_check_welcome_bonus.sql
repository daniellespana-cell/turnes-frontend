-- =========================================================================
-- RPC: rpc_check_welcome_bonus_redeemed
-- =========================================================================
-- DESCRIPTION:
-- Verifica si una empresa ya ha consumido su bono de bienvenida de primer turno gratis.
-- Se usa para ocultar el banner promocional en el Frontend y evitar falsa publicidad.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.rpc_check_welcome_bonus_redeemed(
    p_empresa_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_nit VARCHAR;
    v_nit_limpio VARCHAR;
    v_has_redeemed BOOLEAN;
BEGIN
    -- 1. Extraer el NIT de la empresa
    SELECT nit_rut INTO v_nit 
    FROM public.empresas 
    WHERE id = p_empresa_id 
    LIMIT 1;

    -- Si no tiene NIT, lógicamente no ha podido redimir el bono
    IF v_nit IS NULL OR v_nit = '' THEN
        RETURN FALSE;
    END IF;

    -- 2. Limpiar el NIT igual que en el proceso de pago (Defensa Sybil)
    v_nit_limpio := regexp_replace(v_nit, '\D', '', 'g');

    -- 3. Verificar si existe en la tabla de redimidos
    SELECT EXISTS (
        SELECT 1 
        FROM public.descuentos_bienvenida_redimidos 
        WHERE nit = v_nit_limpio
    ) INTO v_has_redeemed;

    RETURN v_has_redeemed;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_check_welcome_bonus_redeemed(UUID) TO authenticated;
