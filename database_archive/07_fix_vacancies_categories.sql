-- ==============================================================================
-- 🚑 PATCH: REPARAR CATEGORÍAS ROTAS EN VACANTES EXISTENTES
-- Problema: Todas las vacantes antiguas se guardaron con categoria = 'VARIOS'
-- Solución: Este script escanea las etiquetas de cada vacante y asigna 
--           el ID de categoría correcto para que vuelvan a aparecer en los
--           filtros de los Trabajadores (Explorar).
-- ==============================================================================

-- 1. Arreglar las de Gastronomía
UPDATE public.vacantes
SET categoria = 'GASTRO'
WHERE categoria = 'VARIOS' AND (
    etiquetas::text ILIKE '%Mesero%' OR 
    etiquetas::text ILIKE '%Cocinero%' OR 
    etiquetas::text ILIKE '%Ayudante de Cocina%' OR
    etiquetas::text ILIKE '%Parrilero%' OR
    etiquetas::text ILIKE '%Bartender%' OR
    etiquetas::text ILIKE '%Barista%' OR
    etiquetas::text ILIKE '%Comida Rápida%' OR
    etiquetas::text ILIKE '%Panadero%' OR
    etiquetas::text ILIKE '%Pizzero%' OR
    etiquetas::text ILIKE '%Steward%' OR
    etiquetas::text ILIKE '%Repostero%'
);

-- 2. Arreglar las de Transporte
UPDATE public.vacantes
SET categoria = 'TRANSPORTE'
WHERE categoria = 'VARIOS' AND (
    etiquetas::text ILIKE '%Conductor%' OR 
    etiquetas::text ILIKE '%Taxista%' OR 
    etiquetas::text ILIKE '%Plataforma%'
);

-- 3. Arreglar las de Construcción
UPDATE public.vacantes
SET categoria = 'CONSTRUCCION'
WHERE categoria = 'VARIOS' AND (
    etiquetas::text ILIKE '%Ayudante de Obra%' OR 
    etiquetas::text ILIKE '%Oficial%' OR 
    etiquetas::text ILIKE '%Pintor%' OR 
    etiquetas::text ILIKE '%Todero%' OR 
    etiquetas::text ILIKE '%Electricista%' OR 
    etiquetas::text ILIKE '%Plomero%'
);

-- 4. Arreglar las de Logística
UPDATE public.vacantes
SET categoria = 'LOGISTICA'
WHERE categoria = 'VARIOS' AND (
    etiquetas::text ILIKE '%Cotero%' OR 
    etiquetas::text ILIKE '%Bodeguero%' OR 
    etiquetas::text ILIKE '%Empacador%' OR 
    etiquetas::text ILIKE '%Ruta%'
);

-- Refrescar la caché (Opcional, útil para ver los cambios instantáneos)
NOTIFY pgrst, 'reload schema';
