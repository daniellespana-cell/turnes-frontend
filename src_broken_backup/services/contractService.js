
import { supabase } from './supabaseClient';
import { FINANCE_ERRORS } from './financeService';
import { logger } from '../utils/logger';

/**
 * 📜 CONTRACT SERVICE (Protocolo v2.6 - Senior Architecture)
 * - Frontend = Orquestador tonto (solo pide, no decide).
 * - Backend (RPC) = Reglas de Negocio y Seguridad.
 */

export const PROTOCOL_STEPS = {
    APPLIED: 0,
    PAID: 1,
    VIDEO_VALIDATED: 2,
    AGREEMENT_CONFIRMED: 3,
    FINALIZED: 4
};

export const ContractService = {

    /**
     * Paso 1: Pagar Comisión (RPC Seguro)
     */
    async step1_payCommission(applicationId, candidateName) {
        try {
            logger.dev('💰 [RPC] step1_payCommission_v3:', applicationId);

            const { data, error } = await supabase.rpc('rpc_process_protocol_step1_v3', {
                p_application_id: applicationId,
                p_candidate_name: candidateName
            });

            if (error) {
                console.error("❌ RPC Error:", error);

                // Mapeo detallado de errores de negocio desde SQL
                if (error.message.includes('INSUFFICIENT_FUNDS')) throw FINANCE_ERRORS.INSUFFICIENT_FUNDS;
                if (error.message.includes('ALREADY_PAID')) return { success: true, alreadyPaid: true }; // Handle idempotency gracefully
                if (error.message.includes('UNAUTHORIZED')) throw { code: 'UNAUTHORIZED', message: 'No tienes permisos.' };

                throw error;
            }

            // Notificar cambios financieros
            window.dispatchEvent(
                new CustomEvent('turnes_wallet_update', { detail: { balance: data.new_balance } })
            );

            return { success: true, newBalance: data.new_balance, txId: data.tx_id };

        } catch (error) {
            logger.error('[ContractService] Error crítico de pago:', error);
            throw error;
        }
    },

    /**
     * Obtiene el estado actual (Source of Truth)
     */
    async getContractStatus(applicationId) {
        if (!applicationId) return { step: PROTOCOL_STEPS.APPLIED, isPaid: false, history: null, status: 'pendiente' };

        const { data, error } = await supabase
            .from('postulaciones')
            .select('step, is_paid, protocol_state, status')
            .eq('id', applicationId)
            .maybeSingle();

        if (error) throw error;

        if (!data) return { step: PROTOCOL_STEPS.APPLIED, isPaid: false, history: null, status: 'pendiente' };

        return {
            step: data.step || PROTOCOL_STEPS.APPLIED,
            isPaid: data.is_paid,
            history: data.protocol_state,
            status: data.status
        };
    },

    /**
     * Paso 2: Solicitar Videollamada (Validación de Límites)
     */
    async step2_requestVideo(applicationId) {
        const { data, error } = await supabase.rpc('rpc_request_video_validation', {
            p_application_id: applicationId
        });

        if (error) {
            console.error("❌ RPC Video Request Error:", error);
            if (error.message.includes('MAX_VIDEO_VALIDATIONS_REACHED')) {
                throw { code: 'MAX_VIDEOS', message: 'Has alcanzado el límite de 4 validaciones de video para esta vacante.' };
            }
            if (error.message.includes('UNAUTHORIZED')) throw { code: 'UNAUTHORIZED', message: 'No tienes permisos.' };
            throw error;
        }

        return data; // { success: true, remaining: X }
    },

    /**
     * Paso 2: Finalizar Validación Visual (RPC Persistence)
     */
    async step2_confirmVideo(applicationId) {
        try {
            logger.dev('📹 [RPC] step2_confirmVideo:', applicationId);
            const { data, error } = await supabase.rpc('rpc_confirm_video', {
                p_application_id: applicationId
            });
            if (error) {
                console.error("❌ RPC Confirm Video Error:", error);
                throw error;
            }
            return { success: true, data };
        } catch (err) {
            console.error("Error validando video persistencia:", err);
            throw err;
        }
    },

    /**
     * Obtener estadísticas de video para una vacante (Para Badge UI)
     */
    async getVideoStats(vacancyId) {
        if (!vacancyId) return { used: 0, total: 4, remaining: 4 };
        const { data, error } = await supabase.rpc('rpc_get_video_stats', {
            p_vacante_id: vacancyId
        });

        if (error) return { used: 0, total: 4, remaining: 4 };
        return data;
    },

    /**
     * Paso 3: Confirmar Acuerdo (RPC)
     */
    async step3_confirmAgreement(applicationId) {
        try {
            logger.dev('🤝 [RPC] step3_confirmAgreement:', applicationId);
            const { data, error } = await supabase.rpc('rpc_confirm_agreement', {
                p_application_id: applicationId
            });
            if (error) {
                console.error("❌ RPC Confirm Error:", error);
                throw error;
            }
            return { success: true, data };
        } catch (err) {
            console.error("Error confirmando acuerdo:", err);
            throw err;
        }
    },

    /**
     * Paso 4: Sellar el Chat (Bloquear)
     * Enruta a la Red de Confianza
     */
    async step4_sealChat(applicationId) {
        try {
            logger.dev('🔒 [RPC] step4_sealChat_v2:', applicationId);

            const { data, error } = await supabase.rpc('rpc_seal_chat_v2', {
                p_application_id: applicationId
            });

            if (error) {
                console.error("❌ RPC Seal Error:", error);
                throw error;
            }
            return { success: true, data };
        } catch (err) {
            console.error("Error sellando chat:", err);
            throw err;
        }
    },

    /**
     * Paso 4: Finalizar (RPC)
     */
    async step4_finalize(applicationId) {
        // Delegamos lógica al servidor.
        const { error } = await supabase.rpc('rpc_finalize_contract', {
            p_application_id: applicationId
        });

        if (error) {
            console.error("❌ RPC Finalize Error:", error);
            throw error;
        }
        return { success: true };
    },

    /**
     * Obtener estadísticas de contratos (Perfil)
     * Detecta automáticamente si el usuario es empresa o trabajador para contar correctamente.
     */
    async getStats(userId) {
        if (!userId) return { completed: 0 };
        try {
            // 1. Obtener el perfil para saber el rol
            const { data: profile } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', userId)
                .single();

            if (profile?.rol === 'empresa') {
                // 🏢 EMPRESA: Contar postulaciones en sus vacantes
                // Primero obtenemos los IDs de sus vacantes para evitar Joins costosos o erróneos
                const { data: vacantes } = await supabase
                    .from('vacantes')
                    .select('id')
                    .eq('empresa_id', userId);
                
                if (!vacantes || vacantes.length === 0) return { completed: 0 };
                
                const vacanteIds = vacantes.map(v => v.id);
                const { count, error } = await supabase
                    .from('postulaciones')
                    .select('*', { count: 'exact', head: true })
                    .in('vacante_id', vacanteIds)
                    .eq('status', 'finalizado');

                if (error) throw error;
                return { completed: count || 0 };
            } else {
                // 👷 TRABAJADOR: Sus propias postulaciones
                const { count, error } = await supabase
                    .from('postulaciones')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('status', 'finalizado');

                if (error) throw error;
                return { completed: count || 0 };
            }
        } catch (error) {
            console.error("🔥 Error crítico en ContractService.getStats:", error);
            return { completed: 0 }; // Silenciamos el error para no romper la UI
        }
    }
};
