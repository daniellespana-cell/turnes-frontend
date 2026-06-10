-- =========================================================================
-- PARCHE DE EMERGENCIA: REPARACIÓN DE BACKFILL CHATS
-- Si el script anterior falló por culpa de usuarios o vacantes "huérfanas",
-- este script lo soluciona garantizando que solo integre datos 100% seguros.
-- =========================================================================

-- 1. Inserción Blindada: Solo selecciona postulaciones cuyos dueños sigan existiendo en "perfiles"
INSERT INTO public.turnes_chats (id, empresa_id, postulante_id)
SELECT 
    p.id as id,
    v.empresa_id as empresa_id,
    p.user_id as postulante_id
FROM public.postulaciones p
JOIN public.vacantes v ON p.vacante_id = v.id
JOIN public.perfiles pe ON pe.id = v.empresa_id  -- Solo empresas vivas
JOIN public.perfiles pt ON pt.id = p.user_id     -- Solo trabajadores vivos
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurarnos que la tabla Mensajes no se haya quedado a medias
ALTER TABLE public.mensajes 
    ADD COLUMN IF NOT EXISTS leido BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
    
-- 3. (OPCIONAL DE SEGURIDAD) Si aún así falla RLS, podemos forzar un bypass TEMPORAL
-- para administradores si se quisiera, pero con las políticas actuales,
-- una vez que el turnes_chats se llena (Paso 1), la visibilidad se restaura de inmediato.
