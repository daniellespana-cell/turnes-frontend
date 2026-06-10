import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export const useChatFinance = (candidato) => {
    const [finanzas, setFinanzas] = useState({
        cargoServicio: 0,
        pagoPersonal: 0,
        plan: '...',
        labelCobro: 'Cargando...',
        beneficioPlan: null,
        isFijo: false,
        isLoading: true
    });

    useEffect(() => {
        const fetchQuote = async () => {
            if (!candidato?.id) return;

            try {
                // 🚀 SENIOR SOT: Consultar al servidor el precio real
                const { data, error } = await supabase.rpc('rpc_get_hiring_quote', {
                    p_application_id: candidato.id
                });

                if (error) throw error;

                const isFijo = data.tipo_turno?.toLowerCase() === 'fijo';
                const plan = data.plan?.charAt(0).toUpperCase() + data.plan?.slice(1) || 'Básico';
                
                let beneficioPlan = null;
                if (data.plan === 'pro') beneficioPlan = isFijo ? 'Gratis (Plan Pro)' : 'Comisión 0% (Plan Pro)';
                if (data.plan === 'micro' && isFijo) beneficioPlan = 'Cupo Mensual (Plan Micro)';

                setFinanzas({
                    cargoServicio: Math.round(data.amount),
                    pagoPersonal: candidato.payment || 0,
                    plan: plan,
                    labelCobro: isFijo ? 'Cargo Fijo' : 'Comisión',
                    beneficioPlan,
                    isFijo,
                    isLoading: false,
                    tieneMontoValido: true
                });
            } catch (err) {
                console.error("Error fetching hiring quote (RPC missing?):", err);
                
                // 🛡️ Fallback Resiliente (Para cuando el RPC aún no está en la BD)
                const isFijo = candidato?.vacante?.tipo_turno?.toLowerCase() === 'fijo';
                const plan = candidato?.billingConfig?.plan || 'Básico';
                const sueldo = candidato?.payment || 0;
                
                let cargoFallback = 0;
                let beneficioPlan = null;
                
                if (isFijo) {
                    cargoFallback = plan.toLowerCase() === 'pro' ? 0 : 19900;
                    if (plan.toLowerCase() === 'pro') beneficioPlan = 'Gratis (Plan Pro)';
                } else {
                    const comisionRate = plan.toLowerCase() === 'pro' ? 0 : (plan.toLowerCase() === 'micro' ? 0.04 : 0.06);
                    cargoFallback = sueldo * comisionRate;
                    if (plan.toLowerCase() === 'pro') beneficioPlan = 'Comisión 0% (Plan Pro)';
                }

                setFinanzas({
                    cargoServicio: Math.round(cargoFallback),
                    pagoPersonal: sueldo,
                    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
                    labelCobro: isFijo ? 'Cargo Único Turnes' : 'Comisión Turnes',
                    beneficioPlan,
                    isFijo,
                    isLoading: false,
                    tieneMontoValido: true
                });
            }
        };

        fetchQuote();
    }, [candidato?.id]);

    return finanzas;
};
