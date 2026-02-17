import { GeoService } from './geoService';

/**
 * 🧠 MATCH SERVICE
 * El cerebro de Turnes. Calcula la compatibilidad entre Vacante y Usuario.
 * Principio KISS: Algoritmo de pesos simple y efectivo.
 */
export const MatchService = {

    // CONSTANTES DE PESO (Configuración del Algoritmo)
    WEIGHTS: {
        DISTANCE: 40,
        CATEGORY: 30,
        REPUTATION: 30
    },

    /**
     * Calcula el Score (0-100) para una lista de vacantes
     * @param {Array} vacancies 
     * @param {Object} userProfile 
     */
    scoreVacancies(vacancies, userProfile) {
        if (!userProfile) return vacancies.map(v => ({ ...v, matchScore: 0 }));

        return vacancies.map(vacancy => {
            const score = this.calculateScore(vacancy, userProfile);
            return {
                ...vacancy,
                matchScore: score,
                isHighMatch: score >= 85
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Algoritmo de Scoring Individual
     * @param {Object} vacancy 
     * @param {Object} user 
     */
    calculateScore(vacancy, user) {
        // 0. VALIDACIÓN DE COORDENADAS (Evitar falso positivo "Bogotá")
        if (!user.lat || !user.lng || !vacancy.lat || !vacancy.lng) {
            return 0;
        }

        let score = 0;

        // 1. DISTANCIA (Max 40 pts)
        const dist = GeoService.calculateDistance(
            user.lat, user.lng,
            vacancy.lat, vacancy.lng
        );

        if (dist < 2) score += this.WEIGHTS.DISTANCE; // 40
        else if (dist < 5) score += (this.WEIGHTS.DISTANCE * 0.75); // 30
        else if (dist < 10) score += (this.WEIGHTS.DISTANCE * 0.25); // 10

        // 2. CATEGORÍA (Max 30 pts)
        const userCategories = user.categories || [];
        if (userCategories.includes(vacancy.category)) {
            score += this.WEIGHTS.CATEGORY;
        }

        // 3. RECIPROCIDAD / REPUTACIÓN (Max 30 pts)
        if (vacancy.empresas?.verificado) score += (this.WEIGHTS.REPUTATION * 0.5);
        if ((vacancy.empresas?.calificacion || 0) >= 4.5) score += (this.WEIGHTS.REPUTATION * 0.5);

        return Math.min(100, score);
    }
};
