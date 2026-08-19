import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocationResolver } from './useLocationResolver';
import { getCategoriasList } from '../domain/vacantes.taxonomy';
import { talentService } from '../services/talentService';

export const useTalentSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocationResolver();

    // 1. Core State
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [activeSector, setActiveSector] = useState('TODOS');
    
    const LIMIT = 15;
    const SEARCH_RADIUS_KM = 5;

    // 2. Anti-Spam Debounce (Solo disparamos búsquedas cada 500ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 500);
        return () => clearTimeout(timer);
    }, [query]);

    // 3. Jitter geográfico preventivo (Evita DDOS por fluctuaciones mínimas del GPS)
    const debouncedCenter = useMemo(() => {
        if (!location.lat || !location.lng) return null;
        return {
            lat: Number(location.lat.toFixed(3)),
            lng: Number(location.lng.toFixed(3))
        };
    }, [location.lat, location.lng]);

    // 4. Integración React Query (SSOT de Datos)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: ['talent', debouncedCenter?.lat, debouncedCenter?.lng, debouncedQuery, activeSector],
        queryFn: async ({ pageParam = null, signal }) => {
            if (!debouncedCenter) return [];
            
            const { data, error } = await talentService.searchTalent(
                debouncedCenter.lat, 
                debouncedCenter.lng, 
                debouncedQuery, 
                SEARCH_RADIUS_KM, 
                LIMIT, 
                pageParam, 
                activeSector, 
                signal
            );
            
            if (error) throw error;
            return data || [];
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < LIMIT) return undefined;
            const lastTalent = lastPage[lastPage.length - 1];
            return {
                lastDistance: lastTalent.distancia_mts,
                lastId: lastTalent.id
            };
        },
        enabled: !!debouncedCenter && !location.isLoading,
        staleTime: 1000 * 60 * 5, // Caché fresca por 5 minutos
    });

    // 5. Computed Results
    const filteredResults = useMemo(() => {
        if (!data) return [];
        return data.pages.flat();
    }, [data]);

    // 6. Sincronizar URL silenciosamente
    useEffect(() => {
        const newParams = {};
        if (debouncedQuery) newParams.q = debouncedQuery;
        setSearchParams(newParams, { replace: true });
    }, [debouncedQuery, setSearchParams]);

    // 7. Handlers
    const handleSearchClick = () => {
        setDebouncedQuery(query);
    };

    const handleClearSearch = () => {
        setQuery('');
        setDebouncedQuery('');
        setActiveSector('TODOS');
    };

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        query,
        setQuery,
        activeSector,
        setActiveSector,
        loading: isLoading || location.isLoading,
        isFetching,
        loadingMore: isFetchingNextPage,
        hasMore: hasNextPage,
        error: error?.message || null,
        filteredResults,
        handleSearchClick,
        handleClearSearch,
        loadMore,
        refetch,
        taxonomyOptions: getCategoriasList()
    };
};
