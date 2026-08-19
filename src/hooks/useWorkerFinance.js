import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import FinanceService from '../services/financeService';

/**
 * useWorkerFinance: Hook de Lógica Pura (SSOT).
 * Consume FinanceService y gestiona el estado de la UI.
 * Ya no habla directo con la base de datos (Supabase).
 */
export const useWorkerFinance = () => {
    const { user, isAuthenticated } = useAuth();
    
    const [history, setHistory] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    
    const mountedRef = useRef(true);
    const offsetRef = useRef(0);

    const fetchFinances = useCallback(async (isLoadMore = false) => {
        if (!isAuthenticated || !user?.id) return;
        
        try {
            if (isLoadMore) setIsLoadingMore(true);
            else {
                if (history.length === 0) setLoading(true);
                offsetRef.current = 0;
            }
            setError(null);

            const LIMIT = 5;
            const currentOffset = offsetRef.current;

            // 🚀 SSOT CALL: El hook ya no sabe CÓMO se consultan los datos, solo los pide.
            const { data, error: dbError } = await FinanceService.getHistory(
                user.id, 
                LIMIT, 
                currentOffset
            );

            if (dbError) throw dbError;

            if (mountedRef.current) {
                if (isLoadMore) {
                    setHistory(prev => [...prev, ...data]);
                    offsetRef.current += LIMIT;
                } else {
                    setHistory(data);
                    offsetRef.current = LIMIT;
                }

                setHasMore(data.length === LIMIT);
            }
        } catch (err) {
            console.error('[useWorkerFinance] Fetch error:', err);
            if (mountedRef.current && history.length === 0) setError('Error al cargar historial.');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, [isAuthenticated, user?.id, history.length]);

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchFinances(true);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchFinances();
        
        // 🚀 REALTIME: El AuthContext ya maneja el saldo globalmente.
        // Solo escuchamos para refrescar la LISTA de movimientos.
        const channel = FinanceService.subscribeToHistory(user?.id, () => {
            fetchFinances();
        });
        
        const onFocus = () => fetchFinances();
        window.addEventListener('focus', onFocus);
        
        return () => {
            mountedRef.current = false;
            window.removeEventListener('focus', onFocus);
            if (channel) FinanceService.unsubscribe(channel);
        };
    }, [fetchFinances, user?.id]);

    const { monthlyMetrics, stats } = useMemo(() => {
        if (!history.length) {
            return {
                monthlyMetrics: [{ month: 'Actual', value: 0 }],
                stats: { avgIncome: '$0', totalEarned: 0, totalShifts: 0, bestMonth: 'N/A' }
            };
        }

        const totalIncome = history.reduce((acc, tx) => acc + tx.amount, 0);

        return {
            monthlyMetrics: [
                { month: 'Mes Pasado', value: Math.floor(totalIncome * 0.4) },
                { month: 'Actual', value: totalIncome }
            ],
            stats: {
                avgIncome: `$${(totalIncome / 1000).toFixed(0)}k`,
                totalEarned: totalIncome,
                totalShifts: history.length,
                bestMonth: 'Mes Actual'
            }
        };
    }, [history]);

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
