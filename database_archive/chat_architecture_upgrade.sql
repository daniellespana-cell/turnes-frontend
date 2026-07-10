-- =========================================================================
-- ARQUITECTURA JOBTODAY: CHATS AISLADOS Y CHECK AZUL
-- Script de Migración Fase 49
-- =========================================================================

-- 1. CREACIÓN DE LA TABLA CHATS OPTIMIZADA
-- Usamos postulacion_id como Primary Key para no romper el frontend existente.
CREATE TABLE IF NOT EXISTS public.turnes_chats (
    id UUID PRIMARY KEY REFERENCES public.postulaciones(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    postulante_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para velocidad extrema en RLS
CREATE INDEX IF NOT EXISTS idx_turnes_chats_empresa ON public.turnes_chats(empresa_id);
CREATE INDEX IF NOT EXISTS idx_turnes_chats_postulante ON public.turnes_chats(postulante_id);

-- 2. HABILITAR RLS EN CHATS
ALTER TABLE public.turnes_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes pueden ver sus chats"
    ON public.turnes_chats
    FOR SELECT
    USING (auth.uid() = empresa_id OR auth.uid() = postulante_id);

-- 3. AUTOMATIZACIÓN (TRIGGER)
-- Cuando una postulación nace o avanza, aseguramos que exista su "puerta de chat"
CREATE OR REPLACE FUNCTION public.crear_chat_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Conseguir el ID de la empresa dueña de la vacante
    SELECT empresa_id INTO v_empresa_id FROM public.vacantes WHERE id = NEW.vacante_id;
    
    IF v_empresa_id IS NOT NULL THEN
        INSERT INTO public.turnes_chats (id, empresa_id, postulante_id)
        VALUES (NEW.id, v_empresa_id, NEW.user_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador: Se crea al postularse.
DROP TRIGGER IF EXISTS trigger_crear_chat ON public.postulaciones;
CREATE TRIGGER trigger_crear_chat
    AFTER INSERT OR UPDATE OF status ON public.postulaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.crear_chat_automatico();


-- 4. BACKFILL (Llenar retroactivamente los chats del sistema antiguo)
INSERT INTO public.turnes_chats (id, empresa_id, postulante_id)
SELECT 
    p.id as id,
    v.empresa_id as empresa_id,
    p.user_id as postulante_id
FROM public.postulaciones p
JOIN public.vacantes v ON p.vacante_id = v.id
ON CONFLICT (id) DO NOTHING;


-- 5. ACTUALIZAR MENSAJES PARA "CHECK AZUL"
ALTER TABLE public.mensajes 
    ADD COLUMN IF NOT EXISTS leido BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 6. POLÍTICAS RLS ULTRARRÁPIDAS EN MENSAJES (Destruimos las burocráticas antiguas via función)
-- Borra pólizas antiguas si existieran
DROP POLICY IF EXISTS "chat_read_policy" ON public.mensajes;
DROP POLICY IF EXISTS "chat_insert_policy" ON public.mensajes;

-- Nueva política de Lectura DIRECTA desde turnes_chats
CREATE POLICY "Mensajes legibles por participantes"
    ON public.mensajes
    FOR SELECT
    USING (
        sender_id = auth.uid() OR 
        conversacion_id IN (
            SELECT id FROM public.turnes_chats 
            WHERE empresa_id = auth.uid() OR postulante_id = auth.uid()
        )
    );

-- Nueva política de Envío DIRECTA desde turnes_chats
CREATE POLICY "Mensajes enviables por participantes"
    ON public.mensajes
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND 
        conversacion_id IN (
            SELECT id FROM public.turnes_chats 
            WHERE empresa_id = auth.uid() OR postulante_id = auth.uid()
        )
    );

-- Permitir marcar como leído
CREATE POLICY "Mensajes actualizables por el receptor"
    ON public.mensajes
    FOR UPDATE
    USING (
        -- Solo puedes alterar un mensaje si TÚ eres parte del chat, pero NO eres el sender_id.
        sender_id != auth.uid() AND
        conversacion_id IN (
            SELECT id FROM public.turnes_chats 
            WHERE empresa_id = auth.uid() OR postulante_id = auth.uid()
        )
    )
    WITH CHECK (
        sender_id != auth.uid() AND
        conversacion_id IN (
            SELECT id FROM public.turnes_chats 
            WHERE empresa_id = auth.uid() OR postulante_id = auth.uid()
        )
    );
