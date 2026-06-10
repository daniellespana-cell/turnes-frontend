-- ==========================================
-- SCRIPT DE MIGRACIÓN: HIGH-PERFORMANCE RLS
-- ==========================================
-- Problema: RLS de mensajes con `LEFT JOIN vacantes` sufre de "RLS Trap" (caídas silenciosas de insert por falta de privilegios secuenciales) y mala performance.
-- Solución: Usar una función SECURITY DEFINER para chequear permisos en crudo, evadiendo ciclos de RLS.

-- 1. Crear función con privilegios de sistema
CREATE OR REPLACE FUNCTION public.can_access_chat(chat_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta como owner de la BD (bypassa RLS interno)
SET search_path = public -- Seguridad preventiva
AS $$
DECLARE
    is_allowed BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM postulaciones p
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = chat_id 
        AND (p.user_id = user_id OR v.empresa_id = user_id)
    ) INTO is_allowed;
    
    RETURN is_allowed;
END;
$$;

-- 2. Limpiar políticas viejas (Espagueti)
DROP POLICY IF EXISTS "Participantes pueden leer" ON public.mensajes;
DROP POLICY IF EXISTS "Participantes pueden enviar mensajes" ON public.mensajes;

-- 3. Inyectar política Senior (Limpia, Rápida, Atómica)
-- Lectura
CREATE POLICY "Lectura Dinamica Chat" ON public.mensajes 
FOR SELECT USING ( can_access_chat(conversacion_id, auth.uid()) );

-- Escritura (Insert)
CREATE POLICY "Escritura Dinamica Chat" ON public.mensajes 
FOR INSERT WITH CHECK ( 
    auth.uid() = sender_id AND 
    can_access_chat(conversacion_id, auth.uid()) 
);

-- Actualización (Para is_read)
CREATE POLICY "Actualizar Mensajes Propios" ON public.mensajes 
FOR UPDATE USING ( can_access_chat(conversacion_id, auth.uid()) );
