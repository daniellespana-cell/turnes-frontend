import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateService } from '../services/candidateService';

/**
 * useBusinessRatings
 * Centraliza la lógica de calificaciones recibidas para la empresa.
 * Similar a useWorkerRatings pero enfocado solo en el historial recibido.
 */
export const useBusinessRatings = () => {
    const { user } = useAuth();
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 5;

    const fetchRatings = useCallback(async (isNextPage = false) => {
        if (!user?.id) return;
        
        const currentPage = isNextPage ? page + 1 : 0;
        if (!isNextPage) setLoadingRatings(true);

        try {
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
            console.error('[useBusinessRatings] Error fetching ratings:', err);
        } finally {
            setLoadingRatings(false);
        }
    }, [user?.id, page, user?.role]);

    useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    const loadMoreRatings = () => fetchRatings(true);

    return {
        user,
        receivedRatings,
        loading: loadingRatings,
        hasMore,
        loadMoreRatings,
        refetch: fetchRatings,
    };
};
