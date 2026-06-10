-- 🧹 LIMPIEZA DE PLANES DUPLICADOS O FANTASMAS
-- Este script elimina cualquier plan que NO sea explícitamente parte del sistema oficial.

-- Los slugs oficiales son:
-- 'basic' (Plan Básico 6%)
-- 'micro' (Plan Micro 4%)
-- 'pro' (Plan Pro 0%)
-- 'verify' (Microservicio legado - Verificación)
-- 'boost' (Microservicio legado - Destacado)

-- 1. Script Seguro de Limpieza (Manejo de Llaves Foráneas)
DO $$
DECLARE
    v_basic_plan_id UUID;
    v_deleted_count INTEGER;
BEGIN
    -- 2. Obtener el ID oficial del Plan Básico (slug = 'basic')
    SELECT id INTO v_basic_plan_id 
    FROM public.planes 
    WHERE slug = 'basic' 
    LIMIT 1;

    -- Si por alguna razón no existe el Plan Básico, abortar para no dañar datos
    IF v_basic_plan_id IS NULL THEN
        RAISE EXCEPTION 'Abortando: No se encontró el Plan Básico oficial (slug=basic).';
    END IF;

    -- 3. Rescatar empresas: Mover a todas las empresas que tengan planes "fantasma" hacia el Plan Básico
    UPDATE public.empresas
    SET plan_id = v_basic_plan_id
    WHERE plan_id IN (
        SELECT id FROM public.planes 
        WHERE slug NOT IN ('basic', 'micro', 'pro', 'verify', 'boost')
           OR slug IS NULL
    );

    -- 4. Ahora sí, ejecutar borrado estricto (Las llaves foráneas ya no nos detendrán)
    DELETE FROM public.planes 
    WHERE slug NOT IN ('basic', 'micro', 'pro', 'verify', 'boost')
       OR slug IS NULL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RAISE NOTICE '🧹 Limpieza completada. Se eliminaron % planes duplicados/basura.', v_deleted_count;
END $$;
