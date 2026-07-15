import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { VacancyService } from '../services/vacancyService';
import { normalizeApplication } from '../domain/vacancy.mapper';

const PAGE_SIZE = 10;

/**
 * 1. FETCH HOOK (Responsabilidad: Leer datos y Paginación)
 */
const useWorkerApplicationsFetch = (user, isAuthenticated, activeTab) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    
    const mountedRef = useRef(true);
    const pageRef = useRef(0);

    const fetchApplications = useCallback(async (isLoadMore = false) => {
        if (!isAuthenticated || !user?.id) {
            setApplications([]);
            setLoading(false);
            return;
        }

        const currentPage = isLoadMore ? pageRef.current + 1 : 0;

        try {
            if (isLoadMore) setIsRefreshing(true);
            else if (pageRef.current === 0) setLoading(true);
            
            if (!isLoadMore) pageRef.current = 0;
            setError(null);

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
                } else {
                    setApplications(formatted);
                    pageRef.current = 0;
                }
                setHasMore(formatted.length === PAGE_SIZE);
            }
        } catch (err) {
            console.error('[useWorkerApplications] Fetch error:', err.message || err);
            if (mountedRef.current && pageRef.current === 0) setError('No pudimos cargar tus postulaciones.');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [isAuthenticated, user?.id, activeTab]);

    const loadMore = useCallback(() => {
        if (!loading && !isRefreshing && hasMore) fetchApplications(true);
    }, [fetchApplications, loading, isRefreshing, hasMore]);

    // Reset and fetch when tab changes
    useEffect(() => {
        mountedRef.current = true;
        pageRef.current = 0;
        setHasMore(true);
        fetchApplications(false);
        return () => { mountedRef.current = false; };
    }, [activeTab, fetchApplications]);

    // SWR Pattern: Window Focus Refetch
    useEffect(() => {
        const onFocus = () => {
            if (mountedRef.current && pageRef.current === 0) fetchApplications(false);
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchApplications]);

    return { applications, setApplications, loading, isRefreshing, error, hasMore, loadMore, fetchApplications, pageRef };
};

/**
 * 2. REALTIME HOOK (Responsabilidad: Sincronizar UI con Base de Datos sin refrescar)
 */
const useWorkerApplicationsRealtime = (user, isAuthenticated, activeTab, setApplications, pageRef, fetchApplications) => {
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    // eslint-disable-next-line react-doctor/effect-needs-cleanup
    useEffect(() => {
        let mounted = true;
        if (!isAuthenticated || !user?.id) return;

        const channel = supabase
            .channel(`public:postulaciones:user:${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'postulaciones',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                if (!mounted) return;

                if (payload.eventType === 'UPDATE') {
                    setApplications(prev => {
                        let next = prev.map(app => 
                            app.id === payload.new.id ? { ...app, status: payload.new.status } : app
                        );
                        const activeStatuses = ['pendiente', 'pendiente_pago', 'confirmado', 'confirmed', 'en_progreso', 'contratado', 'chat_abierto'];
                        const historialStatuses = ['finalizado', 'cancelado', 'rechazado', 'cancelled', 'rejected'];
                        const statuses = activeTabRef.current === 'activas' ? activeStatuses : historialStatuses;
                        return next.filter(app => statuses.includes(app.status));
                    });
                } else if (payload.eventType === 'DELETE') {
                    setApplications(prev => prev.filter(app => app.id !== payload.old.id));
                } else if (payload.eventType === 'INSERT') {
                    if (pageRef.current === 0) fetchApplications(false);
                }
            })
            .subscribe();

        return () => {
            mounted = false;
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, user?.id, fetchApplications, setApplications, pageRef]);
};

/**
 * 3. MUTATIONS HOOK (Responsabilidad: Escribir/Modificar datos)
 */
const useWorkerApplicationsMutations = (setApplications) => {
    const cancelApplication = useCallback(async (applicationId) => {
        try {
            const { error: cancelError } = await VacancyService.cancelApplication(applicationId);
            if (cancelError) throw cancelError;
            
            // Optimistic update
            setApplications(prev => prev.filter(app => app.id !== applicationId));
            return { success: true };
        } catch (err) {
            console.error('[useWorkerApplications] Cancel error:', err);
            return { error: err };
        }
    }, [setApplications]);

    return { cancelApplication };
};

/**
 * 🕵️‍♂️ MAIN HOOK ORCHESTRATOR
 * Compone las 3 responsabilidades de forma limpia y mantenible.
 */
export const useWorkerApplications = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('activas');

    const { 
        applications, setApplications, loading, isRefreshing, 
        error, hasMore, loadMore, fetchApplications, pageRef 
    } = useWorkerApplicationsFetch(user, isAuthenticated, activeTab);

    useWorkerApplicationsRealtime(user, isAuthenticated, activeTab, setApplications, pageRef, fetchApplications);

    const { cancelApplication } = useWorkerApplicationsMutations(setApplications);

    return { 
        applications, 
        loading: loading && !isRefreshing, 
        isRefreshing,
        error, 
        activeTab, 
        setActiveTab, 
        hasMore,
        loadMore,
        cancelApplication,
        refetch: () => fetchApplications(false)
    };
};
