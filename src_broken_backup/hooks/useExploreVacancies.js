import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getCategoriasList } from '../domain/vacantes.taxonomy';
import { useVacancyFilters } from './useVacancyFilters';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from './useGeolocation';
import { useVacancyFetch } from './useVacancyFetch';
import { useVacancyScoring } from './useVacancyScoring';
import { VacancyService } from '../services/vacancyService';
import { applicationService } from '../services/applicationService';
import { CIUDADES_COORDS } from '../domain/geography.config';

const GIRON = { lat: 7.0682, lng: -73.1698 };

/**
 * useExploreVacancies — Orchestrator Hook
 *
 * Composes sub-hooks into a single clean API for ExploreVacancies.jsx:
 *   - useGeolocation     → device GPS / location state
 *   - useVacancyFetch    → data fetching, fallback, normalization
 *   - useVacancyScoring  → scoring algorithm + filter predicates
 *   - useVacancyFilters  → UI filter state
 *
 * This hook contains NO business logic — only composition and state wiring.
 */
export const useExploreVacancies = () => {
    const [activeCategory, setActiveCategoryRaw] = useState('TODOS');
    const [searchQuery,    setSearchQuery]        = useState('');
    const [viewMode,       setViewMode]           = useState('list');
    const [radius,         setRadius]             = useState(3);
    const [appliedIds,     setAppliedIds]         = useState(new Set());

    const geo                       = useGeolocation();
    const { user, isAuthenticated } = useAuth();

    // ── Best-known location (GPS → Profile → Bogotá) ─────────────────────────
    const userLocation = useMemo(() => {
        let profileCity = null;
        if (user?.ciudad_nombre) {
            const searchName = user.ciudad_nombre.trim().toLowerCase();
            const cityKey = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === searchName);
            if (cityKey && CIUDADES_COORDS[cityKey]) profileCity = CIUDADES_COORDS[cityKey];
        }

        return {
            lat:           geo.lat ?? profileCity?.lat ?? GIRON.lat,
            lng:           geo.lng ?? profileCity?.lng ?? GIRON.lng,
            isReal:        Boolean(geo.lat),
            isProfileBased: !geo.lat && Boolean(profileCity),
            isDenied:      geo.denied ?? false,
            user,           // passed into scoring hook
        };
    }, [geo.lat, geo.lng, geo.denied, user]);

    // ── Exploration center (the moveable search sphere) ──────────────────────
    const lastFetchedRef = useRef(null); // tracks whether user has moved manually

    const [explorationCenter, _setExplorationCenter] = useState({
        lat: userLocation.lat, lng: userLocation.lng
    });

    const setExplorationCenter = useCallback((center) => {
        lastFetchedRef.current = center; // mark as manually moved
        _setExplorationCenter(center);
    }, []);

    // Sync center when GPS or profile loads — only if not yet manually moved
    useEffect(() => {
        if (lastFetchedRef.current) return;

        let target = null;
        if (geo.lat) {
            target = { lat: geo.lat, lng: geo.lng };
        } else if (user?.ciudad_nombre) {
            const searchName = user.ciudad_nombre.trim().toLowerCase();
            const cityKey = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === searchName);
            if (cityKey && CIUDADES_COORDS[cityKey]) target = CIUDADES_COORDS[cityKey];
        }

        if (target) _setExplorationCenter(target);
    }, [geo.lat, geo.lng, user?.ciudad_nombre]);

    // ── Sub-hooks ─────────────────────────────────────────────────────────────
    const {
        vacancies, loading, isRefreshing, error,
        isFallbackMode, hasMore, loadMore, subscribeToRealTime
    } = useVacancyFetch(explorationCenter, radius);

    // ── Real-time Sync for Applied Status (SSOT via Service) ─────────────────
    const fetchAppliedIds = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setAppliedIds(new Set());
            return;
        }
        const { data, error } = await applicationService.getAppliedVacancyIds(user.id);
        if (!error) setAppliedIds(new Set(data));
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        fetchAppliedIds();
        if (!isAuthenticated || !user?.id) return;

        // 🛡️ Suscripción Delegada
        const channel = applicationService.subscribeToUserApplications(user.id, () => {
            fetchAppliedIds();
        });

        return () => { 
            import('../services/supabaseClient').then(m => m.supabase.removeChannel(channel));
        };
    }, [fetchAppliedIds, isAuthenticated, user?.id]);

    // Real-time subscription for VACANCIES (external feed)
    useEffect(() => subscribeToRealTime(isAuthenticated), [isAuthenticated, subscribeToRealTime]);

    const {
        filters, toggleFilter, toggleUrgente,
        clearFilters: _clearFilters, isFilterOpen, setIsFilterOpen, activeFilterCount
    } = useVacancyFilters();

    // A10: reset filters when category changes (context-sensitive filters become stale)
    const setActiveCategory = useCallback((cat) => {
        setActiveCategoryRaw(cat);
        _clearFilters();
    }, [_clearFilters]);

    const clearFilters = useCallback(() => _clearFilters(), [_clearFilters]);

    const { filteredVacancies } = useVacancyScoring(
        vacancies, userLocation, filters, activeCategory, searchQuery, radius, appliedIds
    );

    // ── Category list (static from taxonomy) ─────────────────────────────────
    const categories = useMemo(() => [
        { id: 'TODOS', label: 'Todos' },
        ...getCategoriasList().map(c => ({ id: c.id, label: c.label }))
    ], []);

    // ── Apply to vacancy ──────────────────────────────────────────────────────
    const applyToVacancy = useCallback(async (vacancyId) => {
        if (!isAuthenticated || !user?.id) {
            return { success: false, message: 'Inicia sesión para postularte.' };
        }

        // 🚀 OPTIMISTIC UI UPDATE
        setAppliedIds(prev => {
            const next = new Set(prev);
            next.add(vacancyId);
            return next;
        });

        try {
            const { error: applyError } = await VacancyService.apply(vacancyId, user.id);
            if (applyError) throw applyError;
            
            return { success: true, message: '¡Postulación enviada!' };
        } catch (err) {
            // 🛑 ROLLBACK ON ERROR
            setAppliedIds(prev => {
                const revert = new Set(prev);
                revert.delete(vacancyId);
                return revert;
            });

            if (err.code === '23505') return { success: false, message: 'Ya te has postulado a esta vacante.' };
            return { success: false, message: 'Error al enviar postulación. Intenta de nuevo.' };
        }
    }, [isAuthenticated, user?.id]);

    return {
        // Data
        vacancies: filteredVacancies,
        categories,
        appliedIds,
        isFallbackMode,
        // Status
        loading, isRefreshing, error,
        hasMore, loadMore,
        // UI state
        activeCategory, setActiveCategory,
        searchQuery, setSearchQuery,
        viewMode, setViewMode,
        radius, setRadius,
        // Location
        userLocation, explorationCenter, setExplorationCenter,
        // Filters
        filters, toggleFilter, toggleUrgente, clearFilters,
        isFilterOpen, setIsFilterOpen, activeFilterCount,
        // Actions
        applyToVacancy,
    };
};
