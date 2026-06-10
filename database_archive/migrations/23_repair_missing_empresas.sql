-- 🛠️ 23_repair_missing_empresas.sql
-- OBJETIVO: Arreglar la integridad referencial para cuentas de prueba o legadas.
-- El error "violates foreign key constraint vacantes_empresa_id_fkey" ocurre
-- cuando un perfil tiene rol='empresa' pero no existe su fila correspondiente
-- en la tabla "empresas".

BEGIN;

-- Insertar de manera segura todas las empresas faltantes basándose en la tabla de perfiles
INSERT INTO public.empresas (id, nombre_comercial, nit_rut, logo_url, verificado, sector_industrial)
SELECT 
    p.id, 
    COALESCE(p.nombre_empresa, p.nombre_display, 'Empresa Sin Nombre'), 
    COALESCE(p.nit, 'PENDIENTE'),
    p.avatar_url,
    p.verificado,
    p.sector
FROM public.perfiles p
LEFT JOIN public.empresas e ON p.id = e.id
WHERE 
    p.rol = 'empresa' 
    AND e.id IS NULL; -- Filtra solo los que NO existen en empresas

COMMIT;

-- Aviso de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Reparación Completada: Se han generado los registros faltantes en la tabla empresas.';
END $$;
