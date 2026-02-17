
import { supabase } from './supabaseClient';
import { FINANCE_ERRORS } from './financeService';

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
    async step1_payCommission(applicationId, amount, candidateName) {
        try {
            console.log("💰 [RPC] step1_payCommission:", applicationId);

            const { data, error } = await supabase.rpc('rpc_process_protocol_step1', {
                p_application_id: applicationId,
                p_amount: amount,
                p_concept: `Desbloqueo de contacto: ${candidateName}`
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
            console.error("Critical Payment Error:", error);
            throw error;
        }
    },

    /**
     * Obtiene el estado actual (Source of Truth)
     */
    async getContractStatus(applicationId) {
        const { data, error } = await supabase
            .from('postulaciones')
            .select('step, is_paid, protocol_state, status')
            .eq('id', applicationId)
            .single();

        if (error) throw error;

        return {
            step: data.step || PROTOCOL_STEPS.APPLIED,
            isPaid: data.is_paid,
            history: data.protocol_state,
            status: data.status
        };
    },

    /**
     * Paso 3: Confirmar Acuerdo (RPC)
     */
    async step3_confirmAgreement(applicationId) {
        // Delegamos lógica al servidor. Si no pagó, el RPC fallará.
        const { error } = await supabase.rpc('rpc_confirm_agreement', {
            p_application_id: applicationId
        });

        if (error) {
            console.error("❌ RPC Agreement Error:", error);
            throw error;
        }
        return { success: true };
    },

    /**
     * Paso 4: Finalizar (RPC)
     */
    async step4_finalize(applicationId, rating) {
        // Delegamos lógica al servidor.
        const { error } = await supabase.rpc('rpc_finalize_contract', {
            p_application_id: applicationId
        });

        if (error) {
            console.error("❌ RPC Finalize Error:", error);
            throw error;
        }
        return { success: true };
    }
};
