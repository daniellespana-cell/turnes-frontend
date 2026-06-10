-- 🛠️ 22_grant_taxonomy_permissions.sql
-- OBJETIVO: Solucionar Error "permission denied for table taxonomy_sectors"
-- A pesar de tener políticas RLS (CREATE POLICY), las tablas nuevas necesitan
-- permisos explícitos de lectura (GRANT SELECT) para los roles de la API.

BEGIN;

-- 1. CONCEDER PERMISOS AL ROL ANÓNIMO Y AUTENTICADO
GRANT SELECT ON public.taxonomy_sectors TO anon, authenticated;
GRANT SELECT ON public.taxonomy_roles TO anon, authenticated;
GRANT SELECT ON public.taxonomy_skills TO anon, authenticated;

-- Asegurarse de que el RLS esté activo (por si acaso)
ALTER TABLE public.taxonomy_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_skills ENABLE ROW LEVEL SECURITY;

COMMIT;
