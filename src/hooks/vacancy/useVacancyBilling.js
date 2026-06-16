
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FinanceService } from '../../services/financeService';

/**
 * useVacancyBilling (Micro-Hook K.I.S.S)
 * Responsabilidad Única: Cotizar precios en el Backend de forma segura y consultar la billetera.
 */
export const useVacancyBilling = (user, formData) => {
    const [walletBalance, setWalletBalance] = useState(0);
    const [quote, setQuote] = useState({
        total: 0,
        costoBase: 0,
        costoUrgente: 0,
        totalComisiones: 0,
        comisionPorcentaje: 0,
        comisionPorPersona: 0,
        isPriceValid: true,
        isLoading: false
    });

    // 1. Cargar Billetera (Solo al Iniciar)
    useEffect(() => {
        const loadWallet = async () => {
            const userId = user?.id || user?.uid;
            if (!userId) return;
            try {
                const { data } = await FinanceService.getBalance(userId);
                setWalletBalance(data?.saldo || 0);
            } catch (err) {
                console.error("Error fetching wallet:", err);
            }
        };
        loadWallet();
    }, [user?.id, user?.uid]);

    // 2. Cotizar Liquidación (Backend Source of Truth)
    useEffect(() => {
        let isMounted = true;

        const fetchQuote = async () => {
            const userId = user?.id || user?.uid;
            if (!userId || !formData.type) return;

            setQuote(prev => ({ ...prev, isLoading: true }));

            try {
                // RPC Segura: El backend dicta las comisiones y cupos gratuitos, no el Frontend.
                const { data, error } = await supabase.rpc('rpc_quote_vacancy_price', {
                    p_empresa_id: userId,
                    p_type: formData.type,
                    p_quantity: formData.quantity || 1,
                    p_payment: formData.payment || 0,
                    p_is_urgent: formData.isUrgent || false
                });

                if (error) throw error;

                if (isMounted && data) {
                    setQuote({
                        total: data.total,
                        costoBase: data.costoBase,
                        costoUrgente: data.costoUrgente,
                        precioUnitarioUrgente: data.precioUnitarioUrgente || 7000,
                        totalComisiones: data.totalComisiones,
                        comisionPorcentaje: data.comisionPorcentaje,
                        comisionPorPersona: data.comisionPorPersona,
                        isPriceValid: data.isPriceValid,
                        isLoading: false
                    });
                }
            } catch (err) {
                console.error("Error quoting vacancy price. Falbacking to safe defaults.", err);
                if (isMounted) {
                    setQuote(prev => ({ ...prev, isLoading: false, isPriceValid: false }));
                }
            }
        };

        // Debounce simple para evitar saturar el RPC en cada tecla
        const timeoutId = setTimeout(fetchQuote, 300);
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [
        user?.id, user?.uid,
        formData.type,
        formData.quantity,
        formData.payment,
        formData.isUrgent
    ]);

    const hasFunds = walletBalance >= quote.total;

    return {
        walletBalance,
        quote,
        hasFunds
    };
};
