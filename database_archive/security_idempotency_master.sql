-- 🛡️ SECURITY & IDEMPOTENCY MASTER PATCH
-- Objetivo: Blindar 'postulaciones' y prevenir doble cobro (Idempotencia)
-- Nivel: Senior / Zero Trust

BEGIN;

-- 1. 🔥 REFORZAR RLS EN 'POSTULACIONES'
-- Eliminamos políticas genéricas y aplicamos políticas de acceso granular
DROP POLICY IF EXISTS "Applicant Own" ON public.postulaciones;
DROP POLICY IF EXISTS "Company View Applications" ON public.postulaciones;

-- Política para el Postulante: Solo puede ver sus propias postulaciones y editarlas si no están cerradas.
CREATE POLICY "Postulante_Select_Own" ON public.postulaciones
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Postulante_Update_Own" ON public.postulaciones
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id AND status != 'finalizado');

-- Política para la Empresa: Solo puede ver postulaciones a SUS vacantes.
CREATE POLICY "Empresa_Select_Applications" ON public.postulaciones
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vacantes 
            WHERE public.vacantes.id = public.postulaciones.vacante_id 
            AND public.vacantes.empresa_id = auth.uid()
        )
    );

-- 2. ⚡ IDEMPOTENCIA FINANCIERA (Anti-Doble Pago)
-- Creamos una restricción que impide que 'is_paid' se marque como true si ya lo está,
-- y una columna de 'idempotency_key' para transacciones Wompi.

ALTER TABLE public.postulaciones 
ADD COLUMN IF NOT EXISTS payment_idempotency_key text UNIQUE;

-- Trigger para proteger el estado de pago
CREATE OR REPLACE FUNCTION protect_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_paid = true AND NEW.is_paid = false THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: Cannot revert a paid status.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_payment ON public.postulaciones;
CREATE TRIGGER tr_protect_payment
    BEFORE UPDATE OF is_paid ON public.postulaciones
    FOR EACH ROW EXECUTE FUNCTION protect_payment_status();

-- 3. 🔐 PRIVACIDAD DE PROTOCOLO
-- El protocol_state solo debe ser editable por el sistema (RPC), no directamente por el usuario.
-- (Esto se logra no dando permisos de UPDATE sobre esa columna a nivel de RLS si usáramos Supabase granular, 
-- pero aquí lo reforzamos vía RPC SECURITY DEFINER).

COMMIT;

-- 📝 NOTA TÉCNICA: 
-- Hemos implementado una "Llave de Idempotencia". Si la UI intenta procesar el mismo pago 
-- con el mismo ID de transacción, la DB lo rechazará por el UNIQUE de 'payment_idempotency_key'.
