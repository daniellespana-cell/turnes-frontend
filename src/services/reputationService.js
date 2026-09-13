import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { notificationObserver } from './notificationObserver';

/**
 * ⭐ REPUTATION SERVICE
 * Maneja el sistema de confianza (Ratings, Reviews & Doble Ciego).
 * Single Source of Truth para reputación de usuarios y empresas.
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

        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / data.length).toFixed(1);
    },

    /**
     * Obtener las reseñas más recientes (Max N)
     * Optimizada con Query Planner y JOIN manual para evitar PostgREST FK issues.
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
                author_id
            `)
            .eq('target_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        const res = await BaseService.handle(query);
        
        if (res.error || !res.data || res.data.length === 0) return res;

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

        const finalData = res.data.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            author: profilesMap[r.author_id] || null
        }));

        return { data: finalData, error: null };
    },

    /**
     * 🌟 RED DE CONFIANZA: CALIFICAR Y SELLAR (ATOMIC RPC)
     * Ejecuta el RPC que inserta la calificación, calcula el promedio global 
     * del candidato y sella el turno como 'finalizado'.
     */
    async rateAndSealCandidate(applicationId, candidateId, rating, comment, asistio) {
        if (!applicationId || !candidateId || !rating) {
            return { data: null, error: { message: "Faltan parámetros de calificación obligatorios." } };
        }

        const query = supabase.rpc('rpc_rate_and_seal_v3', {
            p_application_id: applicationId,
            p_candidate_id: candidateId,
            p_rating: rating,
            p_comment: comment || null,
            p_asistio: asistio !== false
        });

        return await BaseService.handle(query);
    },

    /**
     * 🌟 RED DE CONFIANZA: DESCARTAR CALIFICACIÓN
     * Marca un proceso como "ignorado" para calificación por parte del trabajador.
     */
    async dismissRating(applicationId) {
        if (!applicationId) return { data: null, error: { message: "Falta ID de postulación" } };

        const query = supabase.rpc('rpc_dismiss_worker_rating', {
            p_application_id: applicationId
        });

        return await BaseService.handle(query);
    },

    /**
     * 🌟 RED DE CONFIANZA: TRABAJADOR CALIFICA EMPRESA (DOBLE CIEGO)
     */
    async rateEmployer(applicationId, employerId, rating, comment) {
        if (!applicationId || !employerId || !rating) {
            return { data: null, error: { message: "Faltan parámetros de calificación obligatorios." } };
        }

        try {
            const query = supabase.rpc('rpc_rate_employer', {
                p_application_id: applicationId,
                p_employer_id: employerId,
                p_rating: rating,
                p_comment: comment || null
            });

            const response = await BaseService.handle(query);
            if (response.error) throw response.error;

            // Notificación anónima para respetar el doble ciego hasta el desbloqueo mutuo
            const { data: companyData } = await supabase
                .from('empresas')
                .select('user_id')
                .eq('id', employerId)
                .single();

            if (companyData?.user_id) {
                await notificationObserver.dispatch(
                    companyData.user_id,
                    'RATING_RECEIVED',
                    applicationId,
                    { 
                        message: "Has recibido una nueva calificación por un turno completado.",
                        rating: rating.toString(),
                        is_anonymous: true
                    }
                );
            }

            return response;
        } catch (error) {
            console.error("[ReputationService] Error en rateEmployer:", error);
            return { data: null, error };
        }
    },

    /**
     * 📖 OBTENER CALIFICACIONES RECIBIDAS (DOBLE CIEGO)
     * Trae el historial de estrellas y comentarios recibidos con máscara de privacidad.
     */
    async getReceivedRatings(userId, role = 'postulante', page = 0, pageSize = 5) {
        if (!userId) return { data: [], error: null };
        
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const query = supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                shift_id,
                author_id
            `)
            .eq('target_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        const response = await BaseService.handle(query);
        
        if (response.error || !response.data) return response;

        const authorIds = [...new Set(response.data.map(r => r.author_id).filter(Boolean))];
        let profilesMap = {};

        if (authorIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('perfiles')
                .select('id, nombre_display, avatar_url')
                .in('id', authorIds);

            if (profilesData) {
                profilesData.forEach(p => profilesMap[p.id] = p);
            }
        }

        response.data = response.data.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            shift_id: r.shift_id,
            author: profilesMap[r.author_id] || null
        }));

        // 🛡️ DOBLE CIEGO: Ocultar contenido si no se ha completado el desbloqueo mutuo
        if (role === 'postulante' && response.data.length > 0) {
            const shiftIds = response.data.map(r => r.shift_id).filter(Boolean);
            
            if (shiftIds.length > 0) {
                const { data: postulaciones } = await supabase
                    .from('postulaciones')
                    .select('id, protocol_state')
                    .in('id', shiftIds);
                
                const postMap = {};
                if (postulaciones) {
                    postulaciones.forEach(p => postMap[p.id] = p.protocol_state);
                }

                response.data = response.data.map(review => {
                    if (!review.shift_id) return review; 
                    const protocol = postMap[review.shift_id] || {};
                    const isUnlocked = protocol.ratings_unlocked === true;
                    
                    if (isUnlocked) return review;

                    return {
                        ...review,
                        isLocked: true,
                        rating: 0,
                        comment: "Califica a la empresa para desbloquear este comentario.",
                        author: { nombre_display: "Empresa Verificada", avatar_url: null }
                    };
                });
            }
        }
        
        return response;
    },

    /**
     * Publicar una reseña genérica
     */
    async submitReview(reviewData) {
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            return { error: { message: "Rating debe ser entre 1 y 5" } };
        }

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
