import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { VacancyService } from '../services/vacancyService';
import { normalizeApplication } from '../domain/vacancy.mapper';

/**
 * useWorkerApplications
 * 
 * Provides real-time synchronization for worker applications.
 * Replaces mock data with live Supabase queries and subscriptions.
 */
export const useWorkerApplications = () => {
    const { user, isAuthenticated } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('activas'); // 'activas' (pending/confirmed) vs 'pasadas' (completed/cancelled)
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 10;
    const mountedRef = useRef(true);
    const pageRef = useRef(0);
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    const fetchApplications = useCallback(async (isLoadMore = false) => {
        if (!isAuthenticated || !user?.id) {
            setApplications([]);
            setLoading(false);
            return;
        }

        const currentPage = isLoadMore ? pageRef.current + 1 : 0;

        try {
            if (isLoadMore) {
                setIsRefreshing(true);
            } else {
                // Solo mostramos loading global si no hay datos (Resiliencia)
                if (applications.length === 0) setLoading(true);
                pageRef.current = 0;
            }
            setError(null);

            // Determine statuses based on tab
            const statuses = activeTab === 'activas' 
                ? ['pendiente', 'pendiente_pago', 'confirmado', 'confirmed', 'en_progreso', 'contratado', 'chat_abierto'] 
                : ['finalizado', 'cancelado', 'rechazado', 'cancelled', 'rejected'];

            const from = currentPage * PAGE_SIZE;
            const to = (currentPage + 1) * PAGE_SIZE - 1;

            const { data, error: fetchError } = await VacancyService.getMyApplications(user.id, statuses, from, to);

            if (fetchError) throw fetchError;

            if (mountedRef.current) {
                const formatted = (data || []).map(normalizeApplication);

                if (isLoadMore) {
                    setApplications(prev => [...prev, ...formatted]);
                    pageRef.current = currentPage;
                    setPage(currentPage);
                } else {
                    setApplications(formatted);
                    pageRef.current = 0;
                    setPage(0);
                }

                setHasMore(formatted.length === PAGE_SIZE);
            }
        } catch (err) {
            console.error('[useWorkerApplications] Fetch error:', err.message || err);
            if (mountedRef.current && applications.length === 0) setError('No pudimos cargar tus postulaciones.');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [isAuthenticated, user?.id, activeTab]); // 🚀 No depende de page -> No hay loop

    const loadMore = useCallback(() => {
        if (!loading && !isRefreshing && hasMore) {
            fetchApplications(true);
        }
    }, [fetchApplications, loading, isRefreshing, hasMore]);

    // Reset and fetch when tab changes
    useEffect(() => {
        pageRef.current = 0;
        setPage(0);
        setHasMore(true);
        fetchApplications(false);
    }, [activeTab, fetchApplications]);

    // Window Focus Refetch (SWR Pattern)
    useEffect(() => {
        const onFocus = () => {
            if (mountedRef.current && pageRef.current === 0) {
                fetchApplications(false);
            }
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchApplications]);

    // Real-time subscription
    useEffect(() => {
        mountedRef.current = true;
        if (!isAuthenticated || !user?.id) return;

        const channel = supabase
            .channel(`public:postulaciones:user:${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'postulaciones',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                if (!mountedRef.current) return;

                if (payload.eventType === 'UPDATE') {
                    setApplications(prev => {
                        // 1. Update status
                        let next = prev.map(app => 
                            app.id === payload.new.id ? { ...app, status: payload.new.status } : app
                        );
                        // 2. Filter out if no longer belongs to current tab
                        const activeStatuses = ['pendiente', 'pendiente_pago', 'confirmado', 'confirmed', 'en_progreso', 'contratado', 'chat_abierto'];
                        const historialStatuses = ['finalizado', 'cancelado', 'rechazado', 'cancelled', 'rejected'];
                        const statuses = activeTabRef.current === 'activas' ? activeStatuses : historialStatuses;
                        
                        return next.filter(app => statuses.includes(app.status));
                    });
                } else if (payload.eventType === 'DELETE') {
                    setApplications(prev => prev.filter(app => app.id !== payload.old.id));
                } else if (payload.eventType === 'INSERT') {
                    // Only fetch if at top, to not disrupt infinite scroll
                    if (pageRef.current === 0) fetchApplications(false);
                }
            })
            .subscribe();

        return () => {
            mountedRef.current = false;
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, user?.id, fetchApplications]);

    return { 
        applications, 
        loading: loading && !isRefreshing, 
        isRefreshing,
        error, 
        activeTab, 
        setActiveTab, 
        hasMore,
        loadMore,
        refetch: () => fetchApplications(false)
    };
};
