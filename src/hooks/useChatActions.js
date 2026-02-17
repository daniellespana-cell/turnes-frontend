import { useCallback } from 'react';

/**
 * useChatActions
 * Encapsulates the business logic for interactive chat bubbles.
 * - Handles Rehire Acceptance/Decline (localStorage + Events).
 * - Manages message metadata updates (Optimistic UI).
 */
export const useChatActions = ({
    candidato,
    onFinalize,
    messages,
    setMessages // Optional: if we want to mutate local state directly
}) => {

    const handleRehireAction = useCallback((actionType, message) => {
        if (!candidato?.id) return;

        // 1. UPDATE GLOBAL STATE (LocalStorage as DB for Alpha)
        if (actionType === 'ACCEPT_REHIRE') {
            try {
                const red = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
                const nuevaRed = red.map(c =>
                    String(c.id) === String(candidato.id)
                        ? { ...c, videoHabilitado: true, isPaid: false } // Force isPaid: false for safety
                        : c
                );
                localStorage.setItem('turnes_validados', JSON.stringify(nuevaRed));
                // Notify Sidebar to unlock payment step
                window.dispatchEvent(new Event('storage'));
            } catch (e) {
                console.error("Error updating rehire state:", e);
            }
        }

        if (actionType === 'DECLINE_REHIRE') {
            try {
                const red = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
                const nuevaRed = red.map(c =>
                    String(c.id) === String(candidato.id)
                        ? { ...c, cicloCerrado: true, estadoTurno: 'CANCELADO' }
                        : c
                );
                localStorage.setItem('turnes_validados', JSON.stringify(nuevaRed));
                window.dispatchEvent(new Event('storage'));

                // Exit flow
                if (onFinalize) onFinalize();
            } catch (e) {
                console.error("Error declining rehire:", e);
            }
        }

        // 2. UPDATE LOCAL MESSAGE STATE (Visual Feedback)
        // We update the specific message in localStorage to persist the "Accepted/Declined" UI
        try {
            const historyKey = `chat_history_${candidato.id}`;
            // Note: We need the *latest* messages here. 
            // If 'messages' prop is stale, we might fetch from storage or use a callback updater if provided.
            const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');

            const updatedHistory = currentHistory.map(m => {
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
            });

            localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

            // If we have a setter, update the view immediately
            if (setMessages) {
                setMessages(updatedHistory);
            }

        } catch (e) {
            console.error("Error updating chat history:", e);
        }

    }, [candidato?.id, onFinalize, setMessages]); // messages dep removed to avoid stale closures if looking at storage

    return {
        handleRehireAction
    };
};
