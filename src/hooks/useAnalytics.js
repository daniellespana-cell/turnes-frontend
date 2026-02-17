// Archivo: src/hooks/useAnalytics.js

import { useCallback } from 'react';

// Este es un MOCK (sustituto) para que el componente Beneficios pueda compilar.
// En producción, este hook se conectaría a Google Analytics o a un servicio de tracking.

export const useAnalytics = () => {
    // Usamos useCallback para que la función sea estable
    const trackEvent = useCallback((eventName, data = {}) => {
        console.log(`[ANALYTICS] Event Tracked: ${eventName}`, data);
    }, []);
    
    return { trackEvent };
};