import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGeolocation } from './useGeolocation';
import { getCategoriasList, SECTOR_MAP } from '../domain/vacantes.taxonomy';
import { talentService } from '../services/talentService';
import { GeoService } from '../services/geoService';

export const useTalentSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const geo = useGeolocation();

    // Core State
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true); // Solo para el montaje inicial (Skeleton)
    const [isFetching, setIsFetching] = useState(false); // SWR: Para recargas sin destruir UI
    const [loadingMore, setLoadingMore] = useState(false); // Para el spinner inferior
    const [activeSector, setActiveSector] = useState('TODOS');
    const [error, setError] = useState(null);
    const lastFetchedCoord = useRef({ lat: null, lng: null });
    const abortControllerRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 15;

    // Business Logic: SENIOR PostGIS Search (Paginado)
    const performSearch = useCallback(async (term, lat = null, lng = null, pageIndex = 0, isLoadMore = false, abortSignal = null) => {
        if (!isLoadMore && pageIndex === 0 && results.length === 0) setLoading(true); // Initial load
        if (!isLoadMore) setIsFetching(true); // Background refresh
        else setLoadingMore(true);
        
        setError(null);
        try {
            // Unificamos búsqueda a través del Servicio (SSOT) - Radio estricto de 5km
            const offset = pageIndex * LIMIT;
            const { data, error: rpcError } = await talentService.searchTalent(lat, lng, term, 5, LIMIT, offset, activeSector, abortSignal);

            if (rpcError) {
                if (rpcError.isAbort) return; // Silent return for aborted calls
                throw rpcError;
            }
            
            if (!isLoadMore) {
                setResults(data || []);
            } else {
                setResults(prev => [...prev, ...(data || [])]);
            }

            // Si trae menos del límite, significa que ya no hay más en la DB
            setHasMore((data || []).length === LIMIT);

            // URL Sync (Solo actualizamos la URL con el query base)
            if (!isLoadMore) {
                const newParams = {};
                if (term) newParams.q = term;
                setSearchParams(newParams);
            }

        } catch (err) {
            console.error("Talent Search Error:", err);
            setError(err.message || "Error de conexión");
        } finally {
            if (!abortSignal?.aborted) {
                setLoading(false);
                setIsFetching(false);
                setLoadingMore(false);
            }
        }
    }, [setSearchParams, activeSector, results.length]);

    // Load More action (para el Intersection Observer)
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && !isFetching && hasMore && !geo.loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            performSearch(query, geo.lat, geo.lng, nextPage, true);
        }
    }, [loading, loadingMore, isFetching, hasMore, geo, page, query, performSearch]);

    // Reactivity to Geo and Mount
    // 🛡️ REFUERZO ANTI-EGRESS: Evitamos el bucle infinito por fluctuación de GPS
    useEffect(() => {
        let isCancelled = false;
        const timer = setTimeout(() => {
            if (!geo.loading) {
                const lat = geo.lat || 0;
                const lng = geo.lng || 0;

                // 🛡️ ANTI-DDOS: Prevenir llamados si la coordenada no cambió significativamente (0.5km)
                if (lastFetchedCoord.current.lat) {
                    const dist = GeoService.calculateDistance(lat, lng, lastFetchedCoord.current.lat, lastFetchedCoord.current.lng);
                    if (dist < 0.5) return;
                }

                if (!isCancelled) {
                    lastFetchedCoord.current = { lat, lng };
                    setPage(0);
                    setHasMore(true);
                    performSearch(query, lat, lng, 0, false);
                }
            }
        }, 800);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [geo.loading, geo.lat, geo.lng]);

    // 🛡️ REFUERZO DE ARQUITECTURA: 
    // Se elimina el filtro del lado del cliente.
    // Ahora 'results' es la fuente de la verdad, filtrada y paginada directamente desde la BD.
    const filteredResults = results;

    // Internal function to trigger debounced search with AbortController
    const triggerSearch = useCallback((searchTerm = query) => {
        if (geo.loading) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear previous timeout for debounce
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        searchTimeoutRef.current = setTimeout(() => {
            setPage(0);
            setHasMore(true);
            performSearch(searchTerm, geo.lat, geo.lng, 0, false, signal);
        }, 300); // 300ms Debounce
    }, [geo, performSearch, query]);

    // Reactivity to Sector changes
    useEffect(() => {
        triggerSearch();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [activeSector]); // Solo vigila activeSector, geo ya tiene su propio effect

    const handleSearchClick = () => {
        triggerSearch();
    };

    const handleClearSearch = () => {
        setQuery('');
        setActiveSector('TODOS');
        triggerSearch('');
    };

    return {
        query,
        setQuery,
        activeSector,
        setActiveSector,
        loading,
        isFetching,
        loadingMore,
        hasMore,
        error,
        filteredResults,
        handleSearchClick,
        handleClearSearch,
        loadMore,
        taxonomyOptions: getCategoriasList()
    };
};
