import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { VacancyService } from '../services/vacancyService';
import { normalizeApplication } from '../domain/vacancy.mapper';

const PAGE_SIZE = 10;

/**
 * 1. FETCH HOOK (Responsabilidad: Leer datos y Paginación Inteligente con Infinite Query)
 */
const useWorkerApplicationsFetch = (user, isAuthenticated, activeTab) => {
    const queryKey = useMemo(
        () => ['worker-applications', user?.id, activeTab],
        [user?.id, activeTab]
    );

    const {
        data,
        isLoading,
        isFetching,
        isFetchingNextPage,
        error,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam = 0 }) => {
            if (!isAuthenticated || !user?.id) return [];

            const statuses = activeTab === 'activas' 
                ? ['pendiente', 'pendiente_pago', 'confirmado', 'confirmed', 'en_progreso', 'contratado', 'chat_abierto'] 
                : ['finalizado', 'cancelado', 'rechazado', 'cancelled', 'rejected'];

            const from = pageParam * PAGE_SIZE;
            const to = (pageParam + 1) * PAGE_SIZE - 1;

            const { data: rawData, error: fetchError } = await VacancyService.getMyApplications(user.id, statuses, from, to);
            if (fetchError) throw fetchError;
            return (rawData || []).map(normalizeApplication);
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
            return allPages.length;
        },
        initialPageParam: 0,
        enabled: !!isAuthenticated && !!user?.id,
    });

    const applications = useMemo(() => {
        return data?.pages?.flatMap(page => page) || [];
    }, [data]);

    const loadMore = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    return { 
        applications, 
        loading: isLoading, 
        isRefreshing: isFetching && !isLoading && !isFetchingNextPage, 
        error: error ? 'No pudimos cargar tus postulaciones.' : null, 
        hasMore: !!hasNextPage, 
        loadMore, 
        refetch,
        queryKey
    };
};

/**
 * 2. REALTIME HOOK (Responsabilidad: Sincronizar UI con Base de Datos sin refrescar)
 */
const useWorkerApplicationsRealtime = (user, isAuthenticated, queryClient) => {
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const channel = supabase
            .channel(`public:postulaciones:user:${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'postulaciones',
                filter: `user_id=eq.${user.id}`
            }, () => {
                // Invalida la caché de forma reactiva y elegante
                queryClient.invalidateQueries({ queryKey: ['worker-applications', user.id] });
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, user?.id, queryClient]);
};

/**
 * 3. MUTATIONS HOOK (Responsabilidad: Escribir/Modificar datos)
 */
const useWorkerApplicationsMutations = (user, queryClient) => {
    const cancelApplication = useCallback(async (applicationId) => {
        try {
            const { error: cancelError } = await VacancyService.cancelApplication(applicationId);
            if (cancelError) throw cancelError;

            // Invalida la caché para reflejar el cambio de inmediato
            queryClient.invalidateQueries({ queryKey: ['worker-applications', user?.id] });
            return { success: true };
        } catch (err) {
            console.error('[useWorkerApplications] Cancel error:', err);
            return { error: err };
        }
    }, [queryClient, user?.id]);

    return { cancelApplication };
};

/**
 * 🕵️‍♂️ MAIN HOOK ORCHESTRATOR
 * Compone las responsabilidades de forma limpia, modular y sin código espagueti.
 */
export const useWorkerApplications = () => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('activas');

    const { 
        applications, 
        loading, 
        isRefreshing, 
        error, 
        hasMore, 
        loadMore, 
        refetch 
    } = useWorkerApplicationsFetch(user, isAuthenticated, activeTab);

    useWorkerApplicationsRealtime(user, isAuthenticated, queryClient);

    const { cancelApplication } = useWorkerApplicationsMutations(user, queryClient);

    return { 
        applications, 
        loading, 
        isRefreshing,
        error, 
        activeTab, 
        setActiveTab, 
        hasMore,
        loadMore,
        cancelApplication,
        refetch
    };
};
