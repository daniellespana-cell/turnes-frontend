import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { GeoService } from '../services/geoService';
import { VacancyService } from '../services/vacancyService';
import { normalizeVacancy } from '../domain/vacancy.mapper';

const PAGE_SIZE = 15;
const RPC_BUFFER_KM = 3;
const GEO_THRESHOLD_KM = 0.5;

export const useVacancyFetch = (explorationCenter, radius, userId = null) => {
    const queryClient = useQueryClient();
    
    // 🛡️ Geofencing: Only trigger new fetch if user moves more than 500m
    const [debouncedCenter, setDebouncedCenter] = useState(explorationCenter);
    
    useEffect(() => {
        if (!debouncedCenter?.lat || !explorationCenter?.lat) {
            if (explorationCenter?.lat) setDebouncedCenter(explorationCenter);
            return;
        }
        const dist = GeoService.calculateDistance(
            explorationCenter.lat, explorationCenter.lng,
            debouncedCenter.lat, debouncedCenter.lng
        );
        if (dist >= GEO_THRESHOLD_KM) {
            setDebouncedCenter(explorationCenter);
        }
    }, [explorationCenter, debouncedCenter]);

    const enabled = Boolean(debouncedCenter?.lat && debouncedCenter?.lng);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['vacancies', debouncedCenter?.lat, debouncedCenter?.lng, radius, userId],
        queryFn: async ({ pageParam = { lastDistance: null, lastId: null } }) => {
            const { data: rawData, error: fetchError } = await GeoService.fetchNearby(
                debouncedCenter.lat,
                debouncedCenter.lng,
                radius + RPC_BUFFER_KM,
                userId,
                PAGE_SIZE,
                pageParam.lastDistance,
                pageParam.lastId
            );

            if (fetchError) throw fetchError;

            const coordCounts = new Map();
            const normalized = (rawData || []).map(v => normalizeVacancy(v, coordCounts, false));
            
            let nextCursor = undefined;
            if (rawData && rawData.length === PAGE_SIZE) {
                const lastRow = rawData[rawData.length - 1];
                nextCursor = {
                    lastDistance: lastRow.distancia_mts,
                    lastId: lastRow.id
                };
            }

            return {
                normalized,
                nextCursor
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const vacancies = data ? data.pages.flatMap(page => page.normalized) : [];
    
    // Deduplicate vacancies on the fly
    const uniqueVacancies = Array.from(new Map(vacancies.map(v => [v.id, v])).values());

    const subscribeToRealTime = useCallback((isAuthenticated) => {
        if (!isAuthenticated) return () => {};
        
        const channel = VacancyService.subscribeToNew((payload) => {
            const queryKey = ['vacancies', debouncedCenter?.lat, debouncedCenter?.lng, radius, userId];
            
            if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && payload.new.status !== 'activa')) {
                const idToRemove = payload.old?.id || payload.new?.id;
                if (idToRemove) {
                    queryClient.setQueryData(queryKey, (oldData) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map(page => ({
                                ...page,
                                normalized: page.normalized.filter(v => v.id !== idToRemove)
                            }))
                        };
                    });
                }
            } else if (payload.eventType === 'INSERT' && payload.new?.status === 'activa') {
                // Background refetch on new inserts
                queryClient.invalidateQueries({ queryKey });
            }
        });
        
        return () => VacancyService.unsubscribe(channel);
    }, [debouncedCenter, radius, userId, queryClient]);

    return {
        vacancies: uniqueVacancies,
        loading: status === 'pending' && isFetching,
        isRefreshing: isFetchingNextPage || (isFetching && status !== 'pending'),
        error: error ? error.message : null,
        isFallbackMode: false,
        hasMore: !!hasNextPage,
        loadMore: fetchNextPage,
        fetch: refetch,
        subscribeToRealTime
    };
};
