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
        // En un esquema Senior, el promedio ya viene precalculado en el perfil.
        // Pero si necesitamos forzar la lectura cruda:
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
                author_id,
                perfiles!reviews_author_id_fkey(
                    nombre_display,
                    avatar_url
                )
            `)
            .eq('target_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        const res = await BaseService.handle(query);
        
        if (res.error || !res.data || res.data.length === 0) return res;

        // Fetch manual de perfiles para evitar crashes de FK de PostgREST en producción
        // y mantener compatibilidad 100% con el esquema actual.
        const authorIds = [...new Set(res.data.map(r => r.author_id).filter(Boolean))];
        let profilesMap = {};

        if (authorIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('perfiles')
                .select('id, nombre_display, avatar_url, rol')
                .in('id', authorIds);

            if (profilesData) {
                profilesData.forEach(p => profilesMap[p.id] = p);
            }
        }

        // Mapeamos para que la UI reciba los mismos campos que antes
        const finalData = res.data.map(r => ({
            id: r.id,
            rating: r.rating, // UI mapped
            comment: r.comment,
            created_at: r.created_at,
            author: profilesMap[r.author_id] || null
        }));

        return { data: finalData, error: null };
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

        // Map UI format to Database Format
        const payload = {
            target_id: reviewData.target_id,
            author_id: reviewData.author_id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            shift_id: reviewData.shift_id
        };

        const query = supabase
            .from('reviews')
            .insert(payload)
            .select()
            .single();

        return BaseService.handle(query);
    }
};
