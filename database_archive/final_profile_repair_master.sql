-- 🚀 FINAL PROFILE REPAIR MASTER (Nivel Senior)
-- Repara: 1. RPC de Carga, 2. Persistencia de Geo, 3. Sincronización de Email

BEGIN;

-- 1. ASEGURAR COLUMNAS (Idempotente)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='lat') THEN
        ALTER TABLE public.perfiles ADD COLUMN lat double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='lng') THEN
        ALTER TABLE public.perfiles ADD COLUMN lng double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='perfiles' AND column_name='email') THEN
        ALTER TABLE public.perfiles ADD COLUMN email text;
    END IF;
    -- 🏢 EMPRESAS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='lat') THEN
        ALTER TABLE public.empresas ADD COLUMN lat double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='lng') THEN
        ALTER TABLE public.empresas ADD COLUMN lng double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='geo_point') THEN
        ALTER TABLE public.empresas ADD COLUMN geo_point geography(Point, 4326);
    END IF;
END $$;

-- 2. TRIGGER: Sincronización Automática de Email (Auth -> Public)
-- Esto asegura que el correo de registro siempre esté en el perfil.
CREATE OR REPLACE FUNCTION public.fn_sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.perfiles 
    SET email = NEW.email 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_email ON auth.users;
CREATE TRIGGER trg_sync_user_email
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_user_email();

-- 3. REFACTOR: RPC_GET_USER_BOOT_DATA (La fuente de verdad del Frontend)
-- Ahora inyectamos el email de auth.users directamente para que nunca falle.
CREATE OR REPLACE FUNCTION public.rpc_get_user_boot_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile jsonb;
    v_empresas jsonb;
    v_wallet jsonb;
    v_auth_email text;
BEGIN
    -- Obtener email real de la tabla de identidad de Supabase
    SELECT email INTO v_auth_email FROM auth.users WHERE id = p_user_id;

    -- Obtener Perfil
    SELECT to_jsonb(p) INTO v_profile FROM public.perfiles p WHERE p.id = p_user_id;

    IF v_profile IS NULL THEN
        RETURN jsonb_build_object('profile', null, 'wallet', null);
    END IF;

    -- Inyectar email de auth y asegurar campos lat/lng en el JSON
    v_profile := v_profile || jsonb_build_object('email', v_auth_email);

    -- Obtener Empresa
    SELECT to_jsonb(e) INTO v_empresas FROM public.empresas e WHERE e.id = p_user_id;

    IF v_empresas IS NOT NULL THEN
        -- Sincronizar coordenadas de la empresa al perfil si el perfil no las tiene
        IF (v_profile->>'lat') IS NULL AND (v_empresas->>'lat') IS NOT NULL THEN
            v_profile := v_profile || jsonb_build_object('lat', v_empresas->'lat', 'lng', v_empresas->'lng');
        END IF;
        v_profile := v_profile || jsonb_build_object('empresas', jsonb_build_array(v_empresas));
    ELSE
        v_profile := v_profile || jsonb_build_object('empresas', '[]'::jsonb);
    END IF;

    -- Obtener Billetera
    SELECT to_jsonb(b) INTO v_wallet FROM public.billeteras b WHERE b.id = p_user_id;
    IF v_wallet IS NULL THEN
        v_wallet := jsonb_build_object('id', p_user_id, 'saldo', 0);
    END IF;

    RETURN jsonb_build_object('profile', v_profile, 'wallet', v_wallet);
END;
$$;

-- 4. TRIGGER: Sincronización Transaccional Perfil -> Empresa
-- Esto garantiza que si se guarda en Perfiles, la Empresa se actualice SÍ O SÍ.
CREATE OR REPLACE FUNCTION public.fn_sync_profile_to_company()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el usuario es una empresa, sincronizar los datos geográficos automáticamente
    IF NEW.rol = 'empresa' THEN
        UPDATE public.empresas
        SET 
            lat = NEW.lat,
            lng = NEW.lng,
            nombre_comercial = NEW.nombre_empresa
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_to_company ON public.perfiles;
CREATE TRIGGER trg_sync_profile_to_company
AFTER INSERT OR UPDATE OF lat, lng, nombre_empresa ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_profile_to_company();

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ REPARACIÓN MAESTRA v2: Sincronización Perfil-Empresa Soldada.'; END $$;
