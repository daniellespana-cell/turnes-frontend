-- 🛠️ 21_rpc_invite_candidate.sql
-- OBJETIVO: Permitir a una empresa crear una postulación (invitación) para un candidato.
-- Las reglas RLS de la tabla postulaciones normalmente impiden que un usuario (empresa) 
-- inserte un registro donde el user_id es de otra persona (candidato). 
-- Este RPC elude la restricción de forma segura verificando la propiedad de la vacante.

BEGIN;

DROP FUNCTION IF EXISTS public.rpc_invite_candidate(uuid, uuid);

CREATE OR REPLACE FUNCTION public.rpc_invite_candidate(
    p_vacante_id uuid,
    p_candidato_id uuid
)
RETURNS TABLE (
    id uuid,
    vacante_id uuid,
    user_id uuid,
    status text,
    step int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_propia boolean;
    v_nueva_postulacion_id uuid;
BEGIN
    -- 1. Verificar Gobernanza: ¿La empresa que llama es dueña de la vacante?
    SELECT EXISTS (
        SELECT 1 FROM public.vacantes v
        WHERE v.id = p_vacante_id AND v.empresa_id = auth.uid() AND v.status = 'activa'
    ) INTO v_empresa_propia;

    IF NOT v_empresa_propia THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: No eres dueño de esta vacante o no está activa.';
    END IF;

    -- 2. Asegurar que no haya duplicados (Idempotencia)
    -- Si ya existe la invitación, la retornamos
    SELECT p.id INTO v_nueva_postulacion_id
    FROM public.postulaciones p
    WHERE p.vacante_id = p_vacante_id AND p.user_id = p_candidato_id;

    IF v_nueva_postulacion_id IS NOT NULL THEN
        RETURN QUERY SELECT p.id, p.vacante_id, p.user_id, p.status, p.step 
        FROM public.postulaciones p WHERE p.id = v_nueva_postulacion_id;
        RETURN;
    END IF;

    -- 3. Inserción con Privilegios Elevados (Bypassing RLS)
    INSERT INTO public.postulaciones (
        vacante_id, 
        user_id, 
        status, 
        step
    ) VALUES (
        p_vacante_id,
        p_candidato_id,
        'pendiente',
        0
    )
    RETURNING postulaciones.id INTO v_nueva_postulacion_id;

    -- 4. Retornar los datos insertados
    RETURN QUERY SELECT p.id, p.vacante_id, p.user_id, p.status, p.step 
    FROM public.postulaciones p WHERE p.id = v_nueva_postulacion_id;

END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rpc_invite_candidate(uuid, uuid) TO authenticated;

COMMIT;
