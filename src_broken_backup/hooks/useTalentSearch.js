import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGeolocation } from './useGeolocation';
import { getCategoriasList, SECTOR_MAP } from '../domain/vacantes.taxonomy';
import { talentService } from '../services/talentService';

export const useTalentSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const geo = useGeolocation();

    // Core State
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // Para el spinner inferior
    const [activeSector, setActiveSector] = useState('TODOS');
    const [error, setError] = useState(null);
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 15;

    // Business Logic: SENIOR PostGIS Search (Paginado)
    const performSearch = useCallback(async (term, lat = null, lng = null, pageIndex = 0, isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);
        
        setError(null);
        try {
            // Unificamos búsqueda a través del Servicio (SSOT) - Radio estricto de 5km
            const offset = pageIndex * LIMIT;
            const { data, error: rpcError } = await talentService.searchTalent(lat, lng, term, 5, LIMIT, offset);

            if (rpcError) throw rpcError;
            
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
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [setSearchParams]);

    // Load More action (para el Intersection Observer)
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore && !geo.loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            performSearch(query, geo.lat, geo.lng, nextPage, true);
        }
    }, [loading, loadingMore, hasMore, geo, page, query, performSearch]);

    // Reactivity to Geo and Mount
    // 🛡️ REFUERZO ANTI-EGRESS: Evitamos el bucle infinito por fluctuación de GPS
    useEffect(() => {
        if (!geo.loading) {
            setPage(0);
            setHasMore(true);
            performSearch(query, geo.lat, geo.lng, 0, false);
        }
    }, [geo.loading, Math.round((geo.lat || 0) * 1000), Math.round((geo.lng || 0) * 1000)]);

    // Taxonomy Filtering (Client Side for refined UI feedback)
    const filteredResults = useMemo(() => {
        if (activeSector === 'TODOS') return results;
        const sector = SECTOR_MAP.get(activeSector);
        if (!sector) return results;

        const sectorSkillIds = sector.skills.map(s => s.id);
        return results.filter(profile => {
            const candidateSkills = profile.skills || [];
            return candidateSkills.some(s => sectorSkillIds.includes(s)) || profile.sector === activeSector;
        });
    }, [results, activeSector]);

    const handleSearchClick = () => {
        setPage(0);
        setHasMore(true);
        performSearch(query, geo.lat, geo.lng, 0, false);
    };

    const handleClearSearch = () => {
        setQuery('');
        setPage(0);
        setHasMore(true);
        performSearch('', geo.lat, geo.lng, 0, false);
    };

    return {
        query,
        setQuery,
        activeSector,
        setActiveSector,
        loading,
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
