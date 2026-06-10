-- 💎 MASTER PRICING SYNC: Fuente Única de Verdad (SSOT)
-- Consolidación de Microservicios: Empresa 20k / Postulante 15k.

-- 1. Verificación para EMPRESAS (Premium/Elite)
INSERT INTO "public"."microservices" (
    "id", "title", "price", "target_audience", "description", "icon_key", "is_active"
) VALUES (
    '0d5a961d-7fd5-4c50-a806-e5ec39ccc3e9', 
    'Verificación Premium Empresa', 
    20000.00, 
    'EMPRESAS', 
    'Sello de confianza y validación legal para empresas.', 
    'shield-check', 
    true
) ON CONFLICT (id) DO UPDATE SET price = 20000.00, title = 'Verificación Premium Empresa';

-- 2. Verificación para TRABAJADORES (Postulante Elite)
-- Usamos un ID consistente para la arquitectura
INSERT INTO "public"."microservices" (
    "id", "title", "price", "target_audience", "description", "icon_key", "is_active"
) VALUES (
    'c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 
    'Verificación Elite Postulante', 
    15000.00, 
    'TRABAJADORES', 
    'Aumenta tu empleabilidad con el sello de confianza oficial.', 
    'shield-check', 
    true
) ON CONFLICT (id) DO UPDATE SET price = 15000.00, title = 'Verificación Elite Postulante';

-- 3. Perfil Destacado para TRABAJADORES
INSERT INTO "public"."microservices" (
    "id", "title", "price", "target_audience", "description", "icon_key", "is_active"
) VALUES (
    'ea7fda7a-7889-486b-9a65-a3593ab0757e', 
    'Perfil Destacado', 
    15000.00, 
    'TRABAJADORES', 
    'Aparece primero en las búsquedas de las empresas.', 
    'star', 
    true
) ON CONFLICT (id) DO UPDATE SET price = 15000.00;

-- 4. Sincronización de Esquema y Planes Legacy
UPDATE public.planes SET costo_mensual = 20000.00 WHERE slug = 'verify';
ALTER TABLE public.verification_requests ALTER COLUMN amount_paid SET DEFAULT 20000;

-- 5. Limpiar cualquier discrepancia en solicitudes pendientes
UPDATE public.verification_requests SET amount_paid = 20000 WHERE status = 'pending' AND user_role = 'empresa';
UPDATE public.verification_requests SET amount_paid = 15000 WHERE status = 'pending' AND user_role = 'postulante';
