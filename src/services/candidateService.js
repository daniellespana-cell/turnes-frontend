import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { ReputationService } from './reputationService';
import { normalizeCandidateProfile, normalizeChatContext } from '../domain/profile.mapper';

/**
 * 🧑‍💼 CANDIDATE SERVICE
 * Gestión modular de postulaciones, candidatos y pipeline para empresas.
 * Responsabilidad: Ciclo de vida de postulaciones y candidatos.
 * Lógica de reseñas y reputación delegada a ReputationService (SRP).
 */
export const CandidateService = {

    /**
     * Obtener candidatos para una empresa (Dashboard / Historial)
     * @param {string} companyId - ID de la empresa (auth.uid)
     * @param {boolean} includeFinalized - Si se incluyen registros finalizados
     */
    async getCompanyCandidates(companyId, includeFinalized = false) {
        if (!companyId) return { data: [], error: null };

        try {
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
                        calificacion,
                        lat,
                        lng
                    )
                `)
                .in('vacante_id', vacanteIds);

            if (!includeFinalized) {
                query = query.neq('status', 'finalizado');
            }

            query = query.order('created_at', { ascending: false });

            return await BaseService.handle(query);
        } catch (error) {
            console.error("[CandidateService] PostgREST failure handled in getCompanyCandidates:", error);
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

        return await BaseService.handle(query);
    },

    /**
     * 🗂️ ARCHIVAR POSTULACIÓN DEL HISTORIAL
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
                        verificado,
                        lat,
                        lng
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
            console.error("[CandidateService] Error al obtener postulantes:", error);
            return [];
        }
    },

    /**
     * ⭐ GESTIÓN DE FAVORITOS (DB PERSISTED)
     */
    async getFavoritos(companyId) {
        if (!companyId) return [];

        try {
            const { data: vacantes, error: vacantesError } = await supabase
                .from('vacantes')
                .select('id')
                .eq('empresa_id', companyId);

            if (vacantesError) throw vacantesError;
            const vacanteIds = vacantes.map(v => v.id);
            if (vacanteIds.length === 0) return [];

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
                        verificado,
                        lat,
                        lng
                    )
                `)
                .in('vacante_id', vacanteIds)
                .eq('status', 'finalizado')
                .limit(20);

            if (error) throw error;
            if (!data) return [];

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
            console.error("[CandidateService] Error al obtener candidatos previos (Favoritos):", error);
            return [];
        }
    },

    /**
     * 🧩 RESOLVER CONTEXTO DE CHAT (Senior Resolution)
     */
    async getChatContext(userId, partnerId, vacanteId = null) {
        if (!userId || !partnerId) return null;

        try {
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

                if (vacanteId) {
                    dbQuery = dbQuery.eq('vacante_id', vacanteId);
                }

                const res = await dbQuery.order('created_at', { ascending: false }).limit(1).maybeSingle();
                data = res.data;
                error = res.error;
            }

            if (error && error.code !== 'PGRST116') throw error;
            if (!data) return null;

            let companyData = null;
            if (data.vacante?.empresa_id) {
                const { data: empData } = await supabase
                    .from('empresas')
                    .select('nombre_comercial, logo_url')
                    .eq('id', data.vacante.empresa_id)
                    .maybeSingle();

                if (empData) companyData = empData;
            }

            return normalizeChatContext(data, companyData);
        } catch (error) {
            console.error("[CandidateService] Error al obtener contexto de chat:", error);
            return null;
        }
    },

    // ─── DELEGACIONES DE DOMINIO (FACADE PATTERN) ───────────────────────────
    // Preservan 100% de retrocompatibilidad con hooks y componentes existentes
    rateAndSealCandidate: (appId, candId, rating, comment, asistio) => 
        ReputationService.rateAndSealCandidate(appId, candId, rating, comment, asistio),

    dismissRating: (applicationId) => 
        ReputationService.dismissRating(applicationId),

    rateEmployer: (appId, empId, rating, comment) => 
        ReputationService.rateEmployer(appId, empId, rating, comment),

    getReceivedRatings: (userId, role, page, pageSize) => 
        ReputationService.getReceivedRatings(userId, role, page, pageSize),

    // UTILS
    getFirstName(fullName) {
        if (!fullName) return "Talento";
        return fullName.split(' ')[0];
    }
};
