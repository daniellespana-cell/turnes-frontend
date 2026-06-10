-- ============================================================
-- SCRIPT DE SINCRONIZACIÓN DE TAXONOMÍA (SSOT)
-- Ejecuta este script en el SQL Editor de Supabase para 
-- inyectar los roles faltantes que el frontend está intentando
-- mostrar pero que no existen en la base de datos actual.
-- ============================================================

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
-- Transporte / Automotriz (Nuevos)
('LAVADOR_VEHICULOS', 'TRANSPORTE', 'Lavador de Carros / Motos', 5),
('MECANICO', 'TRANSPORTE', 'Mecánico de Carro / Moto', 6),
('LATONERO', 'TRANSPORTE', 'Pintor de Latonería', 7),

-- Gastronomía
('PANADERO', 'GASTRO', 'Panadero', 8),
('COCINERO', 'GASTRO', 'Cocinero (General)', 9),

-- Construcción
('PLOMERO', 'CONSTRUCCION', 'Plomero / Fontanero', 6),

-- Aseo
('OPERARIO_ASEO', 'ASEO_EMP', 'Operario de Servicios Generales', 3),

-- Eventos (El DJ que reportaste como faltante)
('ANIMADOR', 'EVENTOS', 'Animador / Recreacionista', 4),
('DJ', 'EVENTOS', 'DJ / Operador de Sonido', 6)

ON CONFLICT (id) DO UPDATE 
SET label=EXCLUDED.label, 
    sector_id=EXCLUDED.sector_id,
    sort_order=EXCLUDED.sort_order;
