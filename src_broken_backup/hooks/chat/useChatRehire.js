import { useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { CandidateActionService } from '../../services/candidateActionService';

export const useChatRehire = ({
    resolveAppId,
    triggerDomainSync
}) => {
    const { showToast } = useToast();
    const onAcceptRehire = useCallback(async (message) => {
        try {
            const appId = resolveAppId();
            const result = await CandidateActionService.acceptRehireOffer(message.id, appId);
            
            showToast("Oferta Aceptada. Iniciando nuevo ciclo...", "success");
            
            // 🔥 REDIRECCIÓN ESTRATÉGICA: Si el servicio devuelve el nuevo ID, saltamos a él.
            // Si no, forzamos un sync global para que el dispatcher lo encuentre.
            triggerDomainSync();
            
            if (result?.new_application_id) {
                // Pequeño delay para que Supabase propague el nuevo registro
                setTimeout(() => {
                    window.location.href = `/chat/${result.new_application_id}`;
                }, 800);
            }
        } catch (e) {
            showToast(`Error aceptando oferta: ${e.message}`, "error");
        }
    }, [resolveAppId, triggerDomainSync, showToast]);

    const onDeclineRehire = useCallback(async (message) => {
        try {
            const appId = resolveAppId();
            await CandidateActionService.declineRehireOffer(message.id, appId);
            triggerDomainSync();
        } catch (e) {
            showToast(`Error declinando oferta: ${e.message}`, "error");
        }
    }, [resolveAppId, triggerDomainSync]);

    return {
        onAcceptRehire,
        onDeclineRehire
    };
};
