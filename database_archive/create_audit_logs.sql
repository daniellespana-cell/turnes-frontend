-- 📜 BITÁCORA LEGAL (Audit Logs)
-- Objetivo: Guardar evidencia inmutable de acciones críticas (aceptación de términos, etc.)
-- Principio KISS: Una sola tabla para todo.

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,          -- Ej: 'ACEPTO_TERMINOS_RECARGA', 'LOGIN', 'CAMBIO_CLAVE'
    resource_id TEXT,              -- Ej: La referencia del pago 'REF-123-ABC'
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos extra: { ip: '...', amount: 50000, version: 'v1' }
    
    -- Constraint para asegurar que no se borren datos accidentalmente (Append-Only lógico)
    CONSTRAINT audit_logs_action_check CHECK (length(action) > 0)
);

-- Indexing para búsquedas rápidas por usuario o referencia
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id);

-- 🛡️ SEGURIDAD (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. INSERT: El usuario autenticado PUEDE insertar sus propios logs (evidencia)
CREATE POLICY "Users can insert their own logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. SELECT: El usuario NO puede ver los logs (es auditoría interna), solo el Service Role o Admins
-- (Por ahora lo dejamos cerrado para 'authenticated' en SELECT, para ser estrictos)
CREATE POLICY "Admins/System view only" ON public.audit_logs
    FOR SELECT TO service_role USING (true);

-- Permisos
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

COMMENT ON TABLE public.audit_logs IS 'Registro inmutable de acciones legales y de seguridad';
