import { useState, useCallback } from 'react';
import { logger } from '../../utils/logger';

export const useChatUI = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth >= 768 : false
    );

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const abrirModalPago = useCallback(() => setIsConfirmModalOpen(true), []);

    const [isInVideoCall, setIsInVideoCall] = useState(false);
    const [isVideoReinviteModalOpen, setIsVideoReinviteModalOpen] = useState(false); // 🆕 Modal de re-invitación
    
    // 🆕 ACCIONES REACTIVAS SENIOR
    const abrirVideo = useCallback(() => {
        logger.info("📺 [UI_ACTION] Abriendo videollamada...");
        setIsInVideoCall(true);
    }, []);

    const cerrarVideo = useCallback(() => {
        setIsInVideoCall(false);
    }, []);

    return {
        // Panel Visibility
        isPanelOpen,
        setIsPanelOpen,

        // Modals
        isConfirmModalOpen,
        setIsConfirmModalOpen,
        abrirModalPago,
        isVideoReinviteModalOpen,
        setIsVideoReinviteModalOpen,

        // Video
        isInVideoCall,
        setIsInVideoCall,
        abrirVideo,
        cerrarVideo
    };
};
