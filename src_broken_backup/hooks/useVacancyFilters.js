import { useState, useCallback, useMemo } from 'react';

/**
 * useVacancyFilters
 *
 * FIX A6: Added `urgente` boolean filter for "Urgente / Inmediato" quick tags.
 * Keeps filter state fully normalized so adding new dimensions is one-liner.
 */

const INITIAL_FILTERS = {
    types:     [],     // 'Fijo' | 'Temporal'
    schedules: [],     // turno IDs e.g. 'mañana_8_2'
    skills:    [],     // skill IDs from taxonomy
    urgente:   false,  // A6: es_urgente boolean quick filter
};

export const useVacancyFilters = () => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Toggle on/off a single value inside an array-type filter group
    const toggleFilter = useCallback((group, value) => {
        setFilters(prev => {
            const arr = prev[group];
            if (!Array.isArray(arr)) return prev; // safety guard for boolean groups
            const exists = arr.includes(value);
            return { ...prev, [group]: exists ? arr.filter(i => i !== value) : [...arr, value] };
        });
    }, []);

    // A6: Toggle the boolean urgente flag
    const toggleUrgente = useCallback(() => {
        setFilters(prev => ({ ...prev, urgente: !prev.urgente }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const activeFilterCount = useMemo(() =>
        filters.types.length +
        filters.schedules.length +
        filters.skills.length +
        (filters.urgente ? 1 : 0),
    [filters]);

    return {
        filters,
        toggleFilter,
        toggleUrgente,  // A6: dedicated toggle for urgente
        clearFilters,
        isFilterOpen,
        setIsFilterOpen,
        activeFilterCount,
    };
};
