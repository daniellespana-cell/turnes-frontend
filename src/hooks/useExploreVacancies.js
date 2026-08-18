import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getCategoriasList } from '../domain/vacantes.taxonomy';
import { useVacancyFilters } from './useVacancyFilters';
import { useAuth } from '../context/AuthContext';
import { useVacancyFetch } from './useVacancyFetch';
import { useVacancyScoring } from './useVacancyScoring';
import { VacancyService } from '../services/vacancyService';
import { applicationService } from '../services/applicationService';
import { useLocationResolver } from './useLocationResolver';

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
    const location                  = useLocationResolver();
    const [radius,         setRadius]             = useState(location.radiusKm || 3);
    const { user, isAuthenticated } = useAuth();

    // Sincronizar el radio si el resolver cambia de nivel (ej. cae de GPS a Nacional)
    useEffect(() => {
        if (location.radiusKm) {
            setRadius(location.radiusKm);
        }
    }, [location.radiusKm]);
    
    const [appliedIds, setAppliedIds] = useState(new Set());

    // ── SSOT: Sincronizar IDs de vacantes a las que el usuario ya aplicó ─────
    const fetchAppliedIds = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setAppliedIds(new Set());
            return;
        }
        const { data, error } = await applicationService.getAppliedVacancyIds(user.id);
        if (!error && data) {
            setAppliedIds(new Set(data));
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        fetchAppliedIds();
        if (!isAuthenticated || !user?.id) return;

        const channel = applicationService.subscribeToUserApplications(user.id, () => {
            fetchAppliedIds();
        });

        return () => {
            applicationService.unsubscribeChannel(channel);
        };
    }, [fetchAppliedIds, isAuthenticated, user?.id]);

    // ── Best-known location (GPS → Profile → IP → Nacional) ──────────────────
    const userLocation = useMemo(() => ({
        ...location, // Propagamos la ubicación completa (incluye locationMode, cityName)
        lat:            location.lat,
        lng:            location.lng,
        isReal:         location.locationMode === 'exact',
        isProfileBased: location.locationMode === 'profile',
        isDenied:       location.isDenied,
        user,
    }), [location, user]);

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

        if (userLocation.lat && userLocation.lng) {
            _setExplorationCenter({ lat: userLocation.lat, lng: userLocation.lng });
        }
    }, [userLocation.lat, userLocation.lng]);

    // ── Sub-hooks ─────────────────────────────────────────────────────────────
    const {
        vacancies, loading, isRefreshing, error,
        isFallbackMode, hasMore, loadMore, subscribeToRealTime
    } = useVacancyFetch(explorationCenter, radius, user?.id);



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
