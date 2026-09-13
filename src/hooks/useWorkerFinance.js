import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import FinanceService from '../services/financeService';

/**
 * useWorkerFinance: Hook de Lógica Pura (SSOT & CQRS).
 * Consume FinanceService y gestiona el estado de la UI de Finanzas.
 * Sincroniza datos atómicos calculados en PostgreSQL para trabajadores y ledger para empresas.
 */
export const useWorkerFinance = () => {
    const { user, isAuthenticated } = useAuth();
    const isBusiness = user?.role === 'empresa';
    
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({ totalEarned: 0, totalShifts: 0 });
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    
    const mountedRef = useRef(true);
    const offsetRef = useRef(0);

    const fetchFinances = useCallback(async (isLoadMore = false) => {
        if (!isAuthenticated || !user?.id) return;
        
        try {
            if (isLoadMore) {
                setIsLoadingMore(true);
            } else {
                if (history.length === 0) setLoading(true);
                offsetRef.current = 0;
            }
            setError(null);

            const LIMIT = 5;
            const currentOffset = offsetRef.current;

            let fetchedData = [];
            let fetchError = null;

            if (isBusiness) {
                // 🏢 FLUJO EMPRESA: Ledger contable de movimientos (Wompi, recargas, comisiones)
                const { data, error: dbError } = await FinanceService.getHistory(
                    user.id, 
                    LIMIT, 
                    currentOffset
                );
                fetchedData = data || [];
                fetchError = dbError;
            } else {
                // 👷 FLUJO TRABAJADOR: Resumen atómico global + Historial de turnos completados
                if (!isLoadMore) {
                    const [summaryRes, shiftsRes] = await Promise.all([
                        FinanceService.getWorkerFinanceSummary(user.id),
                        FinanceService.getWorkerShiftsHistory(user.id, LIMIT, 0)
                    ]);

                    if (summaryRes?.data && mountedRef.current) {
                        setSummary({
                            totalEarned: summaryRes.data.totalEarned,
                            totalShifts: summaryRes.data.totalShifts
                        });
                    }

                    fetchedData = shiftsRes.data || [];
                    fetchError = shiftsRes.error;
                } else {
                    const { data, error: dbError } = await FinanceService.getWorkerShiftsHistory(
                        user.id,
                        LIMIT,
                        currentOffset
                    );
                    fetchedData = data || [];
                    fetchError = dbError;
                }
            }

            if (fetchError) throw fetchError;

            if (mountedRef.current) {
                if (isLoadMore) {
                    setHistory(prev => [...prev, ...fetchedData]);
                    offsetRef.current += LIMIT;
                } else {
                    setHistory(fetchedData);
                    offsetRef.current = LIMIT;
                }

                setHasMore(fetchedData.length === LIMIT);
            }
        } catch (err) {
            console.error('[useWorkerFinance] Fetch error:', err);
            if (mountedRef.current && history.length === 0) {
                setError('Error al sincronizar historial financiero.');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, [isAuthenticated, user?.id, isBusiness, history.length]);

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchFinances(true);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchFinances();
        
        // 🚀 REALTIME: Suscripción reactiva basada en rol (Zero-F5)
        const channel = isBusiness
            ? FinanceService.subscribeToHistory(user?.id, () => fetchFinances())
            : FinanceService.subscribeToWorkerShifts(user?.id, () => fetchFinances());
        
        const onFocus = () => fetchFinances();
        window.addEventListener('focus', onFocus);
        
        return () => {
            mountedRef.current = false;
            window.removeEventListener('focus', onFocus);
            if (channel) FinanceService.unsubscribe(channel);
        };
    }, [fetchFinances, user?.id, isBusiness]);

    const { monthlyMetrics, stats } = useMemo(() => {
        const totalEarned = isBusiness
            ? history.reduce((acc, tx) => acc + (tx.type === 'deposit' ? tx.amount : -tx.amount), 0)
            : summary.totalEarned;

        const totalShifts = isBusiness
            ? history.length
            : summary.totalShifts;

        const avgIncomeFormatted = totalShifts > 0 
            ? `$${Math.round(totalEarned / totalShifts).toLocaleString()}` 
            : '$0';

        return {
            monthlyMetrics: [
                { month: 'Mes Pasado', value: Math.floor(totalEarned * 0.4) },
                { month: 'Actual', value: totalEarned }
            ],
            stats: {
                avgIncome: avgIncomeFormatted,
                totalEarned,
                totalShifts,
                bestMonth: totalEarned > 0 ? 'Mes Actual' : 'N/A'
            }
        };
    }, [isBusiness, history, summary.totalEarned, summary.totalShifts]);

    return {
        history,
        monthlyMetrics,
        stats,
        loading,
        isLoadingMore,
        hasMore,
        loadMore,
        error,
        refetch: fetchFinances
    };
};
