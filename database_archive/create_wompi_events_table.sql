-- 🚨 FIX CRÍTICO: CREACIÓN DE TABLA WOMPI_EVENTS
-- Esta tabla faltaba en el script anterior y es necesaria para que el Webhook funcione.

CREATE TABLE IF NOT EXISTS public.wompi_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    transaction_id TEXT NOT NULL UNIQUE, -- ID único de Wompi (evita duplicados)
    reference TEXT NOT NULL,
    amount_in_cents BIGINT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB, -- Guardamos todo el JSON por si acaso
    signature TEXT -- Guardamos la firma/checksum recibida
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_wompi_events_transaction_id ON public.wompi_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_wompi_events_reference ON public.wompi_events(reference);

-- Permisos (Solo el Service Role debe poder escribir aquí vía Webhook)
ALTER TABLE public.wompi_events ENABLE ROW LEVEL SECURITY;

-- Política: Nadie público puede ver esto (Solo admins/interno)
CREATE POLICY "Admin view only" ON public.wompi_events
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Webhook insert only" ON public.wompi_events
    FOR INSERT TO service_role WITH CHECK (true);

-- Permisos explícitos
GRANT ALL ON public.wompi_events TO service_role;
REVOKE ALL ON public.wompi_events FROM anon;
REVOKE ALL ON public.wompi_events FROM authenticated;

COMMENT ON TABLE public.wompi_events IS 'Registro inmutable de eventos recibidos desde Wompi';
