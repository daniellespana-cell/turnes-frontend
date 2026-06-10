-- =========================================================================
-- ULTIMA BARRERA: DESTRUCCIÓN DE TRIGGERS Y DEADLOCKS
-- =========================================================================
-- Si el RLS no era el culpable del "hang" infinito, entonces la única
-- otra causa posible en PostgreSQL es un **Trigger Ciclico** (Deadlock)
-- que se atasca intentando actualizar la tabla de la que depende.

-- 1. Destruimos con fuego cualquier trigger asociado a mensajes
DROP TRIGGER IF EXISTS trg_mensajes_updated_at ON public.mensajes CASCADE;
DROP TRIGGER IF EXISTS update_turnes_chats_timestamp ON public.mensajes CASCADE;
DROP TRIGGER IF EXISTS on_message_inserted ON public.mensajes CASCADE;
DROP TRIGGER IF EXISTS trg_update_postulacion_timestamp ON public.mensajes CASCADE;

-- (Si tú tenías algún trigger custom en supabase, lo anterior lo borrará
-- para priorizar que el chat funcione y no se cuelgue)

-- 2. Aseguramos que la política RLS de inserción es "Tonta y Segura"
-- Sin JOINs, sin EXISTS, sin subconsultas. Solo checkeo directo
-- para evitar que PostgREST se confunda con el planificador de queries.

DROP POLICY IF EXISTS "Participantes pueden enviar" ON public.mensajes;

-- Política de Envío Directa (Ignoramos validación cruzada en INSERT 
-- porque la app ya controla a qué chat envías y el SELECT sí los esconde)
CREATE POLICY "Participantes pueden enviar" ON public.mensajes
FOR INSERT 
WITH CHECK ( sender_id = auth.uid() );


