import { useState, useCallback } from 'react';

export const useVacancyFilters = () => {
    const [filters, setFilters] = useState({
        types: [], // 'Fijo', 'Temporal'
        schedules: [], // 'mañana_8_2', etc.
        skills: [] // IDs de skills
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Toggle genérico para arrays
    const toggleFilter = useCallback((group, value) => {
        setFilters(prev => {
            const current = prev[group];
            const exists = current.includes(value);
            return {
                ...prev,
                [group]: exists
                    ? current.filter(item => item !== value) // Remove
                    : [...current, value] // Add
            };
        });
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({ types: [], schedules: [], skills: [] });
    }, []);

    // Cantidad de filtros activos para mostrar Badge
    const activeFilterCount = Object.values(filters)
        .reduce((acc, curr) => acc + curr.length, 0);

    return {
        filters,
        toggleFilter,
        clearFilters,
        isFilterOpen,
        setIsFilterOpen,
        activeFilterCount
    };
};
