import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacancyService } from '../services/vacancyService';

export const useDashboardMetrics = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({
        fillRate: 0,
        averageRating: null,
        totalVacancies: 0,
        filledVacancies: 0,
        percentile: 'Top --',
        loading: true
    });

    useEffect(() => {
        let mounted = true;

        async function fetchMetrics() {
            if (!user?.id) return;

            try {
                // 1. MATCH RATE: SSOT a través de VacancyService (Cero llamadas directas a BD)
                const { data: vacancies, error } = await VacancyService.getMyVacancies(user.id);
                if (error) throw error;

                const total = vacancies?.length || 0;
                const filled = vacancies?.filter(v => v.status === 'cerrada' || v.contratado_id).length || 0;
                const fillRate = total > 0 ? Math.round((filled / total) * 100) : 0;

                // 2. REPUTACIÓN: Usamos el campo sincronizado por el trigger (perfiles.rating)
                // Si es 0, significa que no tiene reviews (el min es 1 estrella)
                const trueRating = Number(user.rating || 0);
                const avgRating = trueRating > 0 ? trueRating.toFixed(1) : null;

                // 3. ECOSISTEMA: Proyección realista basada en datos reales
                let percentile = 'Top 50%';
                if (total === 0) {
                    percentile = 'Nuevo'; // Aún no publica
                } else if (fillRate >= 80 && trueRating >= 4.5) {
                    percentile = 'Top 10%'; // Alta eficiencia y retención
                } else if (fillRate >= 50 && trueRating >= 4.0) {
                    percentile = 'Top 25%'; // Crecimiento sólido
                } else if (fillRate > 0) {
                    percentile = 'Top 50%'; // Promedio activo
                } else {
                    percentile = 'Activo';
                }

                if (mounted) {
                    setMetrics({
                        fillRate,
                        averageRating: avgRating,
                        totalVacancies: total,
                        filledVacancies: filled,
                        percentile,
                        loading: false
                    });
                }

            } catch (error) {
                console.error("Error fetching dashboard metrics:", error);
                if (mounted) setMetrics(prev => ({ ...prev, loading: false }));
            }
        }

        fetchMetrics();

        return () => {
            mounted = false;
        };
    }, [user?.id, user?.rating]);

    return metrics;
};
