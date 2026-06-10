-- ============================================================
-- TURNES: ZERO-TRUST ARCHITECTURE & DLP TRIGGERS
-- Ejecutar en Supabase SQL Editor
-- Resuelve brechas de seguridad críticas (Escalamiento de Privilegios)
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. DATA LOSS PREVENTION (DLP) TRIGGER - TABLA PERFILES
-- Impide modificaciones maliciosas desde el cliente
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.dlp_prevent_unauthorized_profile_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Elevamos permisos deliberadamente para interceptar
AS $$
BEGIN
    -- Validamos si el update vino desde un RPC del backend (Service_Role)
    -- Si es así lo permitimos pasar entero (Ej: un RPC aprobando la verificación).
    -- La función current_user retorna "postgres", "authenticator", "service_role" etc
    IF current_user IN ('postgres', 'service_role') THEN
        RETURN NEW;
    END IF;

    -- Si vino de un authenticated user modificado manualmente por RLS:
    -- Restauramos las columnas sensibles a su valor anterior forzosamente.
    -- El atacante intentará editarlas pero se sobrescribirán con el OLD.
    NEW.rol := OLD.rol;
    NEW.verificado := OLD.verificado;
    NEW.calificacion := OLD.calificacion;
    NEW.estado_cuenta := OLD.estado_cuenta;
    
    -- Los planes se actualizan mediate webhook de pago
    NEW.plan := OLD.plan;
    NEW.plan_expires_at := OLD.plan_expires_at;

    RETURN NEW;
END;
$$;

-- Borrar el trigger si existiera y volverlo a aplicar
DROP TRIGGER IF EXISTS trg_dlp_prevent_malicious_updates ON public.perfiles;

CREATE TRIGGER trg_dlp_prevent_malicious_updates
BEFORE UPDATE ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.dlp_prevent_unauthorized_profile_updates();


-- ─────────────────────────────────────────────────────────────
-- 2. JWT SYNC TRIGGER (The "End of N+1" Patch)
-- Sincroniza estado crítico (rol, verificado) hacia el JWT token de Supabase.
-- Reduce consultas a BD en RLS.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_jwt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo sincronizar si hay un cambio real (ahorra escrituras a Auth.users)
    IF (OLD IS NULL OR NEW.rol IS DISTINCT FROM OLD.rol OR NEW.verificado IS DISTINCT FROM OLD.verificado) THEN
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
                 jsonb_set(
                     COALESCE(raw_user_meta_data, '{}'::jsonb),
                     '{rol}',
                     to_jsonb(NEW.rol::text)
                 ),
                 '{verificado}',
                 to_jsonb(NEW.verificado)
             )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_to_jwt ON public.perfiles;

CREATE TRIGGER trg_sync_profile_to_jwt
AFTER INSERT OR UPDATE OF rol, verificado ON public.perfiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_to_auth_jwt();


-- ─────────────────────────────────────────────────────────────
-- 3. PERMISOS UPDATES (STORAGE)
-- Corrige el error silencioso si el usuario reemplazaba un documento con upsert:true.
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "User updates own docs" ON storage.objects;
CREATE POLICY "User updates own docs"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'verification-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ─────────────────────────────────────────────────────────────
-- 4. REGLA RLS REESCRITA "Admin full access"
-- Ahora usa el JWT en lugar de un SELECT anidado a perfiles.
-- Muchísimo más rápido (Optimización de N+1)
-- ─────────────────────────────────────────────────────────────

-- En verification_requests:
DROP POLICY IF EXISTS "Admin full access" ON public.verification_requests;
CREATE POLICY "Admin full access"
    ON public.verification_requests FOR ALL
    USING (
         -- Lectura directa del token emitido y firmado por Supabase
        COALESCE(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin'
    );

-- En storage "Admin reads all docs":
DROP POLICY IF EXISTS "Admin reads all docs" ON storage.objects;
CREATE POLICY "Admin reads all docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-docs'
        AND COALESCE(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin'
    );

COMMIT;

-- Mensaje en consola de Supabase SQL.
DO $$ BEGIN RAISE NOTICE '✅ Seguridad en Perfiles e Integridad Data aplicada exitosamente.'; END $$;
