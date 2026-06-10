-- 🩺 SCRIPT DE CURACIÓN FINANCIERA V2 (Total Recovery)
-- Objetivo: Rescatar salarios buscando directamente en la intención del mensaje, ignorando el título.

DO $$
DECLARE
    r RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR r IN (
        SELECT 
            v.id as vacante_id,
            (m.metadata->>'price')::NUMERIC as precio_real,
            v.titulo
        FROM public.vacantes v
        JOIN public.postulaciones p ON p.vacante_id = v.id
        JOIN public.mensajes m ON m.conversacion_id = p.id
        WHERE (
            m.metadata->>'intent' = 'RECONTRATACION_DIRECTA' 
            OR v.titulo ILIKE '%RECONTRATACIÓN%'
            OR v.titulo ILIKE '%OF. DIRECTA%'
        )
        AND (v.salario IS NULL OR v.salario <= 5000 OR v.pago_monto <= 5000)
        AND m.metadata->>'price' IS NOT NULL
    ) LOOP
        UPDATE public.vacantes 
        SET salario = r.precio_real, 
            pago_monto = r.precio_real,
            updated_at = now()
        WHERE id = r.vacante_id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Curación completada. Se repararon % vacantes.', v_count;
END $$;
