-- ==============================================================================
-- 🚀 TURNES TAXONOMY SYNC & REPAIR (69_sync_missing_skills_roles.sql)
-- Agrega de forma idempotente los roles y habilidades faltantes en Supabase:
-- - Parrillero / Asador y Planchero en el sector GASTRO
-- - Limpieza de claves duplicadas heredadas
-- ==============================================================================

-- 1. Asegurar sector GASTRO
INSERT INTO public.taxonomy_sectors (id, label, description, icon, color, hex, sort_order)
VALUES ('GASTRO', 'Gastronomía y Bares 🍔', 'Velocidad y técnica. Sector de alta rotación.', 'Utensils', 'text-orange-500', '#f97316', 1)
ON CONFLICT (id) DO UPDATE SET 
    label = EXCLUDED.label,
    description = EXCLUDED.description;

-- 2. Insertar roles faltantes en GASTRO
INSERT INTO public.taxonomy_roles (id, sector_id, label, slug, sort_order, is_active) VALUES
('PARRILLERO', 'GASTRO', 'Parrillero / Asador', 'parrillero', 4, true),
('PLANCHERO', 'GASTRO', 'Planchero / Comida Rápida', 'planchero', 14, true)
ON CONFLICT (id) DO UPDATE SET 
    sector_id = EXCLUDED.sector_id,
    label = EXCLUDED.label,
    slug = EXCLUDED.slug,
    is_active = true;

-- 3. Insertar skills / habilidades especializadas en GASTRO
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order, is_active) VALUES
('PARRILLA', 'GASTRO', 'Parrilla / Parrillero / Asados', 6, true),
('PLANCHA', 'GASTRO', 'Plancha / Planchero / Manejo de Plancha', 7, true),
('MANIPULACION', 'GASTRO', 'Curso Manipulación Alimentos (Vigente)', 1, true),
('COCTELERIA', 'GASTRO', 'Experiencia en Coctelería', 2, true),
('BARISMO', 'GASTRO', 'Manejo Máquina de Café (Básico)', 3, true),
('PROTOCOLO', 'GASTRO', 'Protocolo de Mesa y Etiqueta', 4, true),
('MOTO_PROPIA_GASTRO', 'GASTRO', 'Vehículo Propio + Papeles al día', 5, true)
ON CONFLICT (id) DO UPDATE SET 
    sector_id = EXCLUDED.sector_id,
    label = EXCLUDED.label,
    is_active = true;

-- 4. Notificar a observadores en tiempo real
NOTIFY pgrst, 'reload schema';
