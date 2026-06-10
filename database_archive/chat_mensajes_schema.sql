-- =================================================================
-- 🚨 CHAT SYSTEM RESTORATION SCRIPT
-- =================================================================
-- La tabla 'mensajes' fue eliminada durante el master reset. 
-- Este script la recrea con sus políticas RLS estrictas y habilita 
-- el modo Realtime para que los websockets vuelvan a funcionar.

CREATE TABLE IF NOT EXISTS public.mensajes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id uuid REFERENCES public.postulaciones(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    tipo text DEFAULT 'text',
    metadata jsonb DEFAULT '{}',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON mensajes(created_at);

-- Habilitar Suscripción de Realtime para los clientes
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;

-- Políticas de Seguridad RLS
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes pueden leer mensajes" ON mensajes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM postulaciones p 
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = mensajes.conversacion_id 
        AND (p.user_id = auth.uid() OR v.empresa_id = auth.uid())
    )
);

CREATE POLICY "Participantes pueden enviar mensajes" ON mensajes FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM postulaciones p 
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = mensajes.conversacion_id 
        AND (p.user_id = auth.uid() OR v.empresa_id = auth.uid())
    )
);

CREATE POLICY "Participantes pueden actualizar lectura" ON mensajes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM postulaciones p 
        LEFT JOIN vacantes v ON p.vacante_id = v.id
        WHERE p.id = mensajes.conversacion_id 
        AND (p.user_id = auth.uid() OR v.empresa_id = auth.uid())
    )
);
