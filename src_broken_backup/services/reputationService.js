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
     * Obtener las reseñas más recientes (Max 5)
     * Optimizada con Query Planner y JOIN para traer el autor.
     * @param {string} userId 
     * @param {number} limit 
     */
    async getRecentReviews(userId, limit = 5) {
        if (!userId) return { data: [], error: null };

        const query = supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                author:perfiles!reviews_author_id_fkey(
                    nombre_display,
                    avatar_url,
                    rol
                )
            `)
            .eq('target_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return await BaseService.handle(query);
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
