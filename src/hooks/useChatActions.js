import { PROTOCOL_STEPS } from '../services/contractService';

import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * useChatActions
 * Encapsulates the business logic for interactive chat bubbles.
 * - Handles Rehire Acceptance/Decline securely in DB.
 * - Manages message metadata updates (Optimistic UI).
 */
export const useChatActions = ({
    candidato,
    onFinalize,
    messages,
    setMessages // Optional: if we want to mutate local state directly
}) => {

    const handleRehireAction = useCallback(async (actionType, message) => {
        if (!candidato?.id) return;

        // 1. ATOMIC BUSINESS LOGIC (Server Side via RPC)
        try {
            const rpcAction = actionType === 'ACCEPT_REHIRE' ? 'ACCEPT' : 'DECLINE';
            const { error } = await supabase.rpc('rpc_manage_rehire_actions', {
                p_application_id: candidato.id,
                p_action: rpcAction
            });

            if (error) throw error;
            
            // Refrescar estado global
            window.dispatchEvent(new CustomEvent('turnes_contract_update'));
            if (actionType === 'DECLINE_REHIRE' && onFinalize) onFinalize();
        } catch (e) {
            console.error("Critical Rehire Action Error (RPC):", e);
            return; // Detenemos el feedback visual si la transacción falló
        }

        // 2. UPDATE LOCAL MESSAGE STATE (Optimistic Visual Feedback - React State Only)
        try {
            if (setMessages) {
                setMessages(prev => prev.map(m => {
                    if (m.id === message.id) {
                        return {
                            ...m,
                            metadata: {
                                ...m.metadata,
                                status: actionType === 'ACCEPT_REHIRE' ? 'accepted' : 'declined'
                            }
                        };
                    }
                    return m;
                }));
            }
        } catch (e) {
            console.error("Error updating chat history visual state:", e);
        }

    }, [candidato?.id, onFinalize, setMessages]);

    return {
        handleRehireAction
    };
};
