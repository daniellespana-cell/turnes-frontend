import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 🧑‍💼 CANDIDATE SERVICE
 * Gestión de postulaciones y candidatos para empresas.
 */
export const CandidateService = {

    /**
     * Obtener candidatos para una empresa (Dashboard)
     * @param {string} companyId - ID de la empresa (auth.uid)
     */
    async getCompanyCandidates(companyId) {
        if (!companyId) return { data: [], error: null };

        // Traemos postulaciones donde la vacante pertenece a la empresa
        const query = supabase
            .from('postulaciones')
            .select(`
                *,
                vacante:vacantes!inner(id, titulo, tipo_turno, status), 
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
            .eq('vacante.empresa_id', companyId)
            .order('created_at', { ascending: false });

        return BaseService.handle(query);
    },

    /**
     * Actualizar estado de una postulación (Pipeline)
     * @param {string} applicationId - ID de la postulación
     * @param {string} newStatus - 'pendiente', 'visto', 'chat_abierto', 'rechazado', 'contratado'
     */
    async updateStatus(applicationId, newStatus) {
        const query = supabase
            .from('postulaciones')
            .update({ status: newStatus })
            .eq('id', applicationId)
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Desbloquear contacto (Pagar Tasa)
     * @param {string} applicationId - ID de la postulación
     * @param {string} companyId - ID de quien paga
     */
    async unlockContact(applicationId, companyId) {
        // Esto idealmente debería ser una transacción en Backend (Function),
        // pero por ahora lo hacemos en dos pasos: 
        // 1. FinanceService.pay() (ya lo llamarás desde el hook)
        // 2. Aquí solo marcamos el status 'chat_abierto'

        return this.updateStatus(applicationId, 'chat_abierto');
    }
};
