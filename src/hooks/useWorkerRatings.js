import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkerApplications } from './useWorkerApplications';
import { CandidateService } from '../services/candidateService';
import { VacancyService } from '../services/vacancyService';
import { normalizeApplication } from '../domain/vacancy.mapper';

/**
 * useWorkerRatings
 * Centraliza toda la lógica de calificaciones del postulante.
 * Desacoplado de useWorkerApplications para evitar el bug de las pestañas activas.
 */
export const useWorkerRatings = () => {
    const { user } = useAuth();
    const { refetch: refetchApps } = useWorkerApplications();
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [pendingRatings, setPendingRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [ratingApp, setRatingApp] = useState(null);

    const PAGE_SIZE = 5;

    // 1. Fetch calificaciones recibidas (Incremental)
    const fetchRatings = useCallback(async (isNextPage = false) => {
        if (!user?.id) return;
        try {
            const currentPage = isNextPage ? page + 1 : 0;
            const { data, error } = await CandidateService.getReceivedRatings(user.id, user.role, currentPage, PAGE_SIZE);
            
            if (!error && data) {
                if (isNextPage) {
                    setReceivedRatings(prev => [...prev, ...data]);
                    setPage(currentPage);
                } else {
                    setReceivedRatings(data);
                    setPage(0);
                }
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err) {
            console.error('[useWorkerRatings] Error fetching ratings:', err);
        }
    }, [user?.id, page, user?.role]);

    const loadMoreRatings = () => fetchRatings(true);

    // 2. Fetch procesos pendientes de calificación (independiente del Tab UI)
    const fetchPendingRatings = useCallback(async () => {
        if (!user?.id) return;
        try {
            // Buscamos explícitamente los finalizados, sin importar en qué tab esté el usuario
            const { data, error } = await VacancyService.getMyApplications(user.id, ['finalizado'], 0, 50);
            if (!error && data) {
                const pending = data
                    .filter(app => !app.protocol_state?.candidato_rated && !app.protocol_state?.candidato_ignored_rating)
                    .map(normalizeApplication);
                setPendingRatings(pending);
            }
        } catch (err) {
            console.error('[useWorkerRatings] Error fetching pending ratings:', err);
        }
    }, [user?.id]);

    const handleDismissRating = useCallback(async (applicationId) => {
        try {
            const { error } = await CandidateService.dismissRating(applicationId);
            if (error) throw error;
            await fetchPendingRatings();
        } catch (err) {
            console.error('[useWorkerRatings] Error dismissing rating:', err);
        }
    }, [fetchPendingRatings]);

    // Fetch inicial combinado
    useEffect(() => {
        const loadAll = async () => {
            setLoadingRatings(true);
            await Promise.all([fetchRatings(), fetchPendingRatings()]);
            setLoadingRatings(false);
        };
        loadAll();
    }, [fetchRatings, fetchPendingRatings]);

    // 3. Handler de éxito — reactiva ambas fuentes de datos
    const handleRatingSuccess = useCallback(async () => {
        setRatingApp(null);
        await Promise.all([refetchApps(), fetchRatings(), fetchPendingRatings()]);
    }, [refetchApps, fetchRatings, fetchPendingRatings]);

    return {
        user,
        receivedRatings,
        pendingRatings,
        ratingApp,
        setRatingApp,
        loading: loadingRatings,
        hasMore,
        loadMoreRatings,
        handleRatingSuccess,
        handleDismissRating
    };
};
