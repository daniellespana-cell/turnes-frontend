import { useMemo } from 'react';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FinanceService } from '../services/financeService';

export const useWalletPageLogic = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const { user: authUser, loading: authLoading } = useAuth();

    // Priorizamos authUser para asegurar que el saldo sea el del contexto global actualizado
    const user = authUser || context?.user;
    const userId = user?.id || user?.uid || user?._id;

    const [data, setData] = useState({
        balance: 0,
        transactions: [],
        monthlyIncome: 0,
        commissionsPaid: 0,
        plan: 'Básico'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const hasDataRef = useRef(false);

    /**
     * ORQUESTADOR DE CARGA (Stale-While-Revalidate)
     */
    const fetchData = useCallback(async (isSilent = false) => {
        if (authLoading || !userId) return;

        const shouldShowLoading = !isSilent && !hasDataRef.current;
        if (shouldShowLoading) setIsLoading(true);
        setError(null);

        try {
            // Ejecutamos en paralelo para máxima velocidad
            const [balanceRes, historyRes] = await Promise.all([
                FinanceService.getBalance(userId),
                FinanceService.getHistory(userId, 50) // Traemos las últimas 50 (Ya mapeadas)
            ]);

            if (balanceRes.error) throw balanceRes.error;
            if (historyRes.error) throw historyRes.error;

            const transactions = historyRes.data;
            
            // Cálculos de Métricas (Simples para la UI usando el mapeo SSOT)
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const monthlyIncome = transactions
                .filter(tx => {
                    const d = new Date(tx.dateFull);
                    return d.getMonth() === currentMonth && 
                           d.getFullYear() === currentYear && 
                           tx.type === 'deposit';
                })
                .reduce((acc, tx) => acc + tx.amount, 0);

            const commissionsPaid = transactions
                .filter(tx => tx.rawType === 'COMISION' || tx.business.toLowerCase().includes('comisión'))
                .reduce((acc, tx) => acc + tx.amount, 0);

            hasDataRef.current = true;
            
            setData({
                balance: balanceRes.data?.saldo || 0,
                transactions,
                monthlyIncome,
                commissionsPaid,
                plan: user?.plan || 'Básico'
            });
        } catch (err) {
            console.error("❌ Fallo en Wallet Logic:", err);
            if (!hasDataRef.current) setError(err);
        } finally {
            if (shouldShowLoading) setIsLoading(false);
        }
    }, [userId, authLoading, user?.plan]);

    // Efecto de carga inicial
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Suscripción Real-Time (Zero-F5)
    useEffect(() => {
        if (!userId) return;

        const walletSub = FinanceService.subscribeToWallet(userId, () => fetchData(true));
        const historySub = FinanceService.subscribeToHistory(userId, () => fetchData(true));

        const handleSync = () => fetchData(true);
        window.addEventListener('storage', handleSync);
        window.addEventListener('focus', handleSync);

        return () => {
            FinanceService.unsubscribe(walletSub);
            FinanceService.unsubscribe(historySub);
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('focus', handleSync);
        };
    }, [userId, fetchData]);

    return {
        user,
        data,
        isLoading,
        error,
        fetchData,
        navigate
    };
};
