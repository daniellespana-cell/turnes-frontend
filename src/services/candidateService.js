import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { notificationObserver } from './notificationObserver';
import { normalizeCandidateProfile, normalizeChatContext } from '../domain/profile.mapper';

/**
 * 🧑‍💼 CANDIDATE SERVICE
 * Gestión de postulaciones y candidatos para empresas.
 */
export const CandidateService = {

    /**
     * Obtener candidatos para una empresa (Dashboard)
     * @param {string} companyId - ID de la empresa (auth.uid)
     */
    async getCompanyCandidates(companyId, includeFinalized = false) {
        if (!companyId) return { data: [], error: null };

        try {
            // 🚀 SENIOR APPROACH: Two-Step Query Optimization
            // Paso 1: Obtener los vacante_id directos de la empresa
            const { data: vacantes, error: vacantesError } = await supabase
                .from('vacantes')
                .select('id')
                .eq('empresa_id', companyId);

            if (vacantesError) throw vacantesError;

            const vacanteIds = vacantes.map(v => v.id);
            if (vacanteIds.length === 0) return { data: [], error: null };

            // Paso 2: Traer postulaciones usando el filtro directo IN
            let query = supabase
                .from('postulaciones')
                .select(`
                    *,
                    vacante:vacantes(id, titulo, tipo_turno, status, pago_monto, empresa_id), 
                    candidato:perfiles!postulaciones_user_id_fkey(
                        id, 
                        nombre_display, 
                        avatar_url, 
                        rol,
                        bio,
                        skills,
                        calificacion
                    )
                `)
                .in('vacante_id', vacanteIds);

            // 🚀 Dynamic Senior Filter: 
            // Si es para el historial (Mis Candidatos), traemos todo.
            // Si es para la Mesa de Contratación (Pipeline), ocultamos los finalizados para evitar ruido.
            if (!includeFinalized) {
                query = query.neq('status', 'finalizado');
            }

            query = query.order('created_at', { ascending: false });

            return await BaseService.handle(query);

        } catch (error) {
            console.error("Critical PostgREST failure in getCompanyCandidates handled:", error);
            // Retornamos un objeto normalizado para no romper la UI
            return { data: [], error };
        }
    },

    /**
     * ACTUALIZAR ESTADO (Pipeline)
     */
    async updateStatus(applicationId, newStatus) {
        if (!applicationId) return { data: null, error: { message: "No application ID provided" } };
        const query = supabase
            .from('postulaciones')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', applicationId)
            .select('*, vacante:vacantes(titulo, empresas(nombre_comercial))')
            .maybeSingle();

        const response = await BaseService.handle(query);

        // 🔔 NOTIFICACIONES: Ahora manejadas por TRIGGER SQL (Notifications 2.0)
        // No enviar dispatch manual para evitar duplicados y vulnerabilidades.

        return response;
    },

    /**
     * 🗂️ ARCHIVAR POSTULACIÓN DEL HISTORIAL
     * Marca la postulación como 'archivado' para que no vuelva a aparecer
     * en el historial de la empresa. Los datos y calificaciones se conservan en BD.
     * @param {string} applicationId - UUID de la postulación
     */
    async archiveApplication(applicationId) {
        if (!applicationId) return { data: null, error: { message: "Falta ID de postulación" } };

        const query = supabase
            .from('postulaciones')
            .update({ status: 'archivado', updated_at: new Date().toISOString() })
            .eq('id', applicationId)
            .select('id')
            .single();

        return await BaseService.handle(query);
    },

    /**
     * 🤝 EJECUTAR MATCH (Contratación Atómica)
     * Llama al RPC que aprueba el MATCH y cierra la vacante si corresponde.
     */
    async executeMatch(applicationId, vacancyId) {
        if (!applicationId || !vacancyId) return { data: null, error: { message: "Faltan parámetros" } };

        const query = supabase.rpc('rpc_hire_candidate_v2', {
            p_application_id: applicationId,
            p_vacancy_id: vacancyId
        });

        return await BaseService.handle(query);
    },


    /**
     * 🌟 RED DE CONFIANZA: CALIFICAR Y SELLAR (ATOMIC)
     * Ejecuta el RPC que inserta la calificación, calcula el promedio global 
     * del candidato y sella el turno como 'finalizado'.
     */
    async rateAndSealCandidate(applicationId, candidateId, rating, comment, asistio) {
        if (!applicationId || !candidateId || !rating) return { data: null, error: { message: "Faltan parámetros de calificación obligatorios." } };

        const query = supabase.rpc('rpc_rate_and_seal_v3', {
            p_application_id: applicationId,
            p_candidate_id: candidateId,
            p_rating: rating,
            p_comment: comment || null,
            p_asistio: asistio !== false // Default true si no se especifica explícitamente falso
        });

        return await BaseService.handle(query);
    },

    /**
     * 🌟 RED DE CONFIANZA: DESCARTAR CALIFICACIÓN
     * Marca un proceso como "ignorado" para calificación por parte del trabajador, 
     * limpiando su historial de tareas pendientes.
     */
    async dismissRating(applicationId) {
        if (!applicationId) return { data: null, error: { message: "Falta ID de postulación" } };

        const query = supabase.rpc('rpc_dismiss_worker_rating', {
            p_application_id: applicationId
        });

        return await BaseService.handle(query);
    },

    /**
     * 🌟 RED DE CONFIANZA: TRABAJADOR CALIFICA EMPRESA
     */
    async rateEmployer(applicationId, employerId, rating, comment) {
        if (!applicationId || !employerId || !rating) return { data: null, error: { message: "Faltan parámetros de calificación obligatorios." } };

        try {
            // 1. Ejecutar calificación en DB (Atomic RPC)
            const query = supabase.rpc('rpc_rate_employer', {
                p_application_id: applicationId,
                p_employer_id: employerId,
                p_rating: rating,
                p_comment: comment || null
            });

            const response = await BaseService.handle(query);
            if (response.error) throw response.error;

            // 2. 🔔 NOTIFICACIÓN (Lógica encapsulada)
            // Resolvemos el user_id de la empresa para enviar la notificación
            const { data: companyData } = await supabase
                .from('empresas')
                .select('user_id')
                .eq('id', employerId)
                .single();

            if (companyData?.user_id) {
                // Notificación ANÓNIMA (Senior Privacy Standard)
                // No enviamos candidateName para respetar el Doble Ciego hasta el desbloqueo mutuo
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
            console.error("[CandidateService] Error en rateEmployer:", error);
            return { data: null, error };
        }
    },

    /**
     * 📖 OBTENER CALIFICACIONES RECIBIDAS
     * Trae el historial de estrellas y comentarios recibidos.
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

        // Fetch manual de perfiles para evitar crashes de FK de PostgREST en producción
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

        // Mapeamos para que la UI (y el resto del método) reciba los mismos campos que antes
        response.data = response.data.map(r => ({
            id: r.id,
            rating: r.rating, // UI mapped
            comment: r.comment,
            created_at: r.created_at,
            shift_id: r.shift_id, // UI mapped
            author: profilesMap[r.author_id] || null
        }));

        // 🛡️ DOBLE CIEGO: Ocultar reseñas si las calificaciones no han sido desbloqueadas
        // Solo aplica para postulantes (la empresa siempre califica primero)
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

                    // 🛡️ MÁSCARA SENIOR: Devolvemos el esqueleto pero ocultamos contenido
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
     * 🔍 Buscar Talentos — REMOVED (Dead Code)
     * La búsqueda real se ejecuta desde useTalentSearch.js → supabase.rpc('buscar_talento_cercano')
     * Este método no era invocado por ningún componente.
     */

    /**
     * OBTENER POSTULANTES (Real-time DB)
     */
    async getPostulantes(vacanteId) {
        if (!vacanteId || vacanteId === 'crear' || vacanteId === 'new') return [];

        try {
            const { data, error } = await supabase
                .from('postulaciones')
                .select(`
                    id,
                    status,
                    created_at,
                    candidato:perfiles!postulaciones_user_id_fkey(
                        id,
                        nombre_display,
                        avatar_url,
                        rol,
                        bio,
                        skills,
                        calificacion,
                        verificado
                    )
                `)
                .eq('vacante_id', vacanteId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(p => {
                const profile = p.candidato || {};
                const normalizedProfile = normalizeCandidateProfile(profile);
                return {
                    ...normalizedProfile,
                    applicationId: p.id,
                    status: p.status
                };
            });
        } catch (error) {
            console.error("Error al obtener postulantes:", error);
            return [];
        }
    },

    /**
     * ⭐ GESTIÓN DE FAVORITOS (DB PERSISTED)
     */
    async getFavoritos(companyId) {
        if (!companyId) return [];

        try {
            // 🚀 SENIOR APPROACH: Two-Step Query Optimization for Favoritos/Trust Network
            // Evitamos el `.eq('vacante.empresa_id', ...)` deep filter que rompe el planner y mezcla estados

            // Paso 1: Obtener vacantes directas de la empresa
            const { data: vacantes, error: vacantesError } = await supabase
                .from('vacantes')
                .select('id')
                .eq('empresa_id', companyId);

            if (vacantesError) throw vacantesError;
            const vacanteIds = vacantes.map(v => v.id);
            if (vacanteIds.length === 0) return [];

            // Paso 2: Obtener solo las postulaciones finalizadas de esas vacantes
            const { data, error } = await supabase
                .from('postulaciones')
                .select(`
                    id,
                    candidato:perfiles!postulaciones_user_id_fkey(
                        id, 
                        nombre_display, 
                        avatar_url, 
                        rol, 
                        skills, 
                        calificacion, 
                        verificado
                    )
                `)
                .in('vacante_id', vacanteIds)
                .eq('status', 'finalizado') // ⚠️ STRICT FILTER: Solo finalizado
                .limit(20);

            if (error) throw error;
            if (!data) return [];

            // Normalización Senior (DB -> UI) - Eliminando Duplicados
            const uniqueCandidates = [];
            const seenIds = new Set();

            data.forEach(p => {
                const f = p.candidato;
                if (f && !seenIds.has(f.id)) {
                    seenIds.add(f.id);
                    const normalized = normalizeCandidateProfile(f);
                    if (normalized) {
                        uniqueCandidates.push(normalized);
                    }
                }
            });

            return uniqueCandidates;
        } catch (error) {
            console.error("Error al obtener candidatos previos (Favoritos):", error);
            return [];
        }
    },

    /**
     * 🧩 RESOLVER CONTEXTO DE CHAT (Senior Logic)
     * Resuelve la postulación que une a dos usuarios.
     */
    async getChatContext(userId, partnerId, vacanteId = null) {
        if (!userId || !partnerId) return null;

        try {
            // Intento 1: Asumimos que partnerId es EL UUID DE LA POSTULACION directamente
            let { data, error } = await supabase
                .from('postulaciones')
                .select(`
                    *,
                    vacante:vacantes!inner(
                        id, titulo, tipo_turno, pago_monto, empresa_id
                    ),
                    candidato:perfiles!postulaciones_user_id_fkey(
                        id, nombre_display, avatar_url
                    )
                `)
                .eq('id', partnerId)
                .maybeSingle();

            // Intento 2: partnerId es el UUID del Candidato (viene del Match / router)
            if (!data) {
                let dbQuery = supabase
                    .from('postulaciones')
                    .select(`
                        *,
                        vacante:vacantes!inner(
                            id, titulo, tipo_turno, pago_monto, empresa_id
                        ),
                        candidato:perfiles!postulaciones_user_id_fkey(
                            id, nombre_display, avatar_url
                        )
                    `)
                    .eq('user_id', partnerId);

                // Evitar Deep Filter JOIN (.eq('vacante.empresa_id')) que causa timeout/fallos
                if (vacanteId) {
                    dbQuery = dbQuery.eq('vacante_id', vacanteId);
                }

                const res = await dbQuery.order('created_at', { ascending: false }).limit(1).maybeSingle();

                data = res.data;
                error = res.error;
            }

            if (error && error.code !== 'PGRST116') throw error;
            if (!data) return null;

            // Manual Fetch of Empresa to avoid PostgREST foreign key crashes
            let companyData = null;

            if (data.vacante?.empresa_id) {
                const { data: empData } = await supabase
                    .from('empresas')
                    .select('nombre_comercial, logo_url')
                    .eq('id', data.vacante.empresa_id)
                    .maybeSingle();

                if (empData) {
                    companyData = empData;
                }
            }

            // Normalización de contexto para el Chat usando SOT Mapper
            return normalizeChatContext(data, companyData);

        } catch (error) {
            console.error("Error al obtener contexto de chat:", error);
            return null;
        }
    },

    // UTILS
    getFirstName(fullName) {
        if (!fullName) return "Talento";
        return fullName.split(' ')[0];
    }
};
