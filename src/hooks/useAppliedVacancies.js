import { useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';

const APPLIED_IDS_KEY = 'user_applied_ids';

/**
 * useAppliedVacancies — SSOT Global de Postulaciones (TanStack Query)
 *
 * Responsabilidad Única:
 * - Centralizar los IDs de vacantes postuladas en un único caché global en memoria.
 * - Sincronizar en tiempo real entre todas las páginas (Dashboard, Explorar, Búsqueda, Mapa) con 0ms de latencia.
 * - Evitar peticiones redundantes a Supabase y fragmentación de estado en React.
 */
export const useAppliedVacancies = () => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    // 1. Consulta respaldada por TanStack Query (Caché global en memoria)
    const { data: rawIds = [] } = useQuery({
        queryKey: [APPLIED_IDS_KEY, userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await applicationService.getAppliedVacancyIds(userId);
            if (error) throw error;
            return data || [];
        },
        enabled: Boolean(isAuthenticated && userId),
        staleTime: 1000 * 60 * 5, // 5 minutos de validez sin refetch
        gcTime: 1000 * 60 * 15,    // Conservar en memoria 15 minutos
    });

    // 2. Proyección inmutable a Set para búsquedas instantáneas O(1)
    const appliedIds = useMemo(() => new Set(rawIds), [rawIds]);

    // 3. Suscripción en Tiempo Real (SSOT Push)
    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const channel = applicationService.subscribeToUserApplications(userId, () => {
            // Invalidar / revalidar la clave central en background
            queryClient.invalidateQueries({ queryKey: [APPLIED_IDS_KEY, userId] });
        });

        return () => {
            applicationService.unsubscribeChannel(channel);
        };
    }, [isAuthenticated, userId, queryClient]);

    // 4. Mutación Optimista Global (0ms de latencia)
    const markApplied = useCallback((vacancyId) => {
        if (!userId || !vacancyId) return;
        queryClient.setQueryData([APPLIED_IDS_KEY, userId], (old = []) => {
            if (old.includes(vacancyId)) return old;
            return [...old, vacancyId];
        });
    }, [userId, queryClient]);

    // 5. Rollback en caso de error
    const revertApplied = useCallback((vacancyId) => {
        if (!userId || !vacancyId) return;
        queryClient.setQueryData([APPLIED_IDS_KEY, userId], (old = []) => {
            return old.filter(id => id !== vacancyId);
        });
    }, [userId, queryClient]);

    return {
        appliedIds,
        rawIds,
        markApplied,
        revertApplied,
    };
};
