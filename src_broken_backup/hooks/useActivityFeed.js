import { useState, useEffect } from 'react';
import { ActivityService } from '../services/activityService';

/**
 * useActivityFeed: Hook de Lógica para Actividad Reciente.
 * Centraliza la consulta a la BD y el manejo de estados de carga.
 */
export const useActivityFeed = (userId) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        
        const fetchActivity = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await ActivityService.getActivityFeed(userId);
                if (!error && data) {
                    setItems(data);
                }
            } catch (e) {
                console.error('[useActivityFeed] Error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, [userId]);

    return {
        items,
        isLoading
    };
};
