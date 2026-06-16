
import { supabase } from './supabaseClient';

/**
 * Maneja acciones transaccionales puras relacionadas con candidatos
 */
export const CandidateActionService = {
    /**
     * Lanza una oferta de recontratación inyectando el estado en Base de Datos de Producción
     */
    launchRehireOffer: async (selectedStaff, offerAmount, offerDate) => {
        try {
            // 🛡️ ZERO TECH DEBT: Usamos RPC en PostgreSQL para Atomo-Transaccionalidad
            // Cobra comisión, crea o usa la Vacante Matriz e inyecta la Postulación 'Ticket' directo al chat
            const { data, error } = await supabase.rpc('rpc_launch_rehire_offer', {
                p_candidato_id: selectedStaff.id,
                p_offer_amount: offerAmount,
                p_offer_date: offerDate
            });

            if (error) {
                console.error("Backend RPC Rehire Error:", JSON.stringify(error, null, 2));
                throw error;
            }

            // data.chat_id contiene la ID de la NUEVA postulación limpia
            return { success: true, redirectUrl: `/dashboard/chat/${data.chat_id}` };
        } catch (e) {
            console.error("Failed Supabase Rehire:", JSON.stringify(e, null, 2));
            throw e; // Lanzamos de vuelta para que la UI muestre el Alert si no hay Saldo
        }
    },

    /**
     * El trabajador acepta la propuesta de recontratación directa.
     */
    acceptRehireOffer: async (mensajeId, postulacionId) => {
        try {
            const { data, error } = await supabase.rpc('rpc_accept_rehire_offer', {
                p_mensaje_id: mensajeId,
                p_postulacion_id: postulacionId
            });
            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            console.error("Failed to accept rehire offer:", e);
            throw e;
        }
    },

    /**
     * El trabajador declina la propuesta de recontratación directa.
     */
    declineRehireOffer: async (mensajeId, postulacionId) => {
        try {
            const { data, error } = await supabase.rpc('rpc_decline_rehire_offer', {
                p_mensaje_id: mensajeId,
                p_postulacion_id: postulacionId
            });
            if (error) throw error;
            return { success: true, data };
        } catch (e) {
            console.error("Failed to decline rehire offer:", e);
            throw e;
        }
    }
};
