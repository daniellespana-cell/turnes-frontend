import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * ⭐ REPUTATION SERVICE
 * Maneja el sistema de confianza (Ratings & Reviews).
 */
export const ReputationService = {

    /**
     * Obtener calificación promedio de un usuario/empresa
     * @param {string} userId 
     */
    async getRating(userId) {
        const query = supabase
            .from('reviews')
            .select('rating')
            .eq('target_id', userId);

        const { data, error } = await BaseService.handle(query);

        if (error || !data || data.length === 0) return 0;

        // Calcular promedio simple
        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / data.length).toFixed(1);
    },

    /**
     * Publicar una reseña
     * @param {Object} reviewData { target_id, author_id, rating, comment, shift_id }
     */
    async submitReview(reviewData) {
        // Validaciones
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            return { error: { message: "Rating debe ser entre 1 y 5" } };
        }

        const query = supabase
            .from('reviews')
            .insert(reviewData)
            .select()
            .single();

        return BaseService.handle(query);
    }
};
