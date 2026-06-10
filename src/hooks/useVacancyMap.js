import { useState, useMemo, useCallback } from 'react';

/**
 * 🛰️ USE VACANCY MAP (SENIOR)
 * Hook orquestador de lógica interactiva para el mapa.
 * Separa el estado del mapa de la vista de exploración.
 */
export const useVacancyMap = (vacancies, userLocation, explorationCenter, setExplorationCenter) => {
    const [selectedId, setSelectedId] = useState(null);

    // 🧠 DERIVED STATE: Evita objetos zombis/stale-data
    const selectedVacancy = useMemo(() => 
        selectedId ? vacancies.find(v => v.id === selectedId) : null
    , [selectedId, vacancies]);

    // 📍 COORDINATE COORDINATION
    // El punto de enfoque ahora es la esfera de exploración (La Esfera Móvil)
    const centerPoint = useMemo(() => {
        if (explorationCenter) return [explorationCenter.lat, explorationCenter.lng];
        if (userLocation) return [userLocation.lat, userLocation.lng];
        return [7.0682, -73.1698]; // Girón fallback
    }, [explorationCenter, userLocation]);

    // ⚡ CALLBACKS
    const handleSelect = useCallback((vacancy) => {
        setSelectedId(vacancy?.id || null);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedId(null);
    }, []);

    return {
        // Data
        selectedVacancy,
        centerPoint,
        
        // Handlers
        handleSelect,
        handleClearSelection,
        
        // Props listos para el componente Dumb (VacancyMap)
        mapProps: {
            vacancies,
            userLocation,
            centerPoint,
            explorationCenter,
            setExplorationCenter,
            onSelectVacancy: handleSelect,
            selectedId
        }
    };
};

