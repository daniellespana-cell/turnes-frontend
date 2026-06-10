import { useState, useCallback, useEffect } from 'react';
import { ContractService } from '../../services/contractService';

export const useChatVideo = ({ 
    candidato, 
    userRole, 
    resolveAppId, 
    workflowActions, 
    addMessage, 
    triggerDomainSync,
    onStartVideo,
    cerrarVideo // 🆕 Necesitamos cerrar el overlay localmente
}) => {
    const [isInviting, setIsInviting] = useState(false);
    const [videoStats, setVideoStats] = useState({
        used: 0,
        remaining: 0,
        total: 0
    });

    // --- CARGA INICIAL DE STATS ---
    useEffect(() => {
        const fetchStats = async () => {
            if (userRole !== 'empresa') return;
            try {
                if (!candidato?.applicationId && !candidato?.id) return;
                const appId = resolveAppId();
                const res = await ContractService.getVideoStats(appId);
                if (res) setVideoStats(res);
            } catch (err) {
                console.error("Error fetching video stats:", err);
            }
        };
        fetchStats();
    }, [userRole, resolveAppId, candidato]);

    // --- STEP 2: VIDEO VALIDATION ---
    const invitarAVideoWrapper = useCallback(async () => {
        if (userRole !== 'empresa' || isInviting) return;

        // 🛡️ IDEMPOTENCIA SENIOR: Si ya se alcanzó el límite o ya validó, no permitir.
        if (videoStats.remaining <= 0) {
            addMessage("🚫 Límite de validaciones alcanzado para esta vacante.", 'system', 'error_alert');
            return;
        }

        setIsInviting(true);
        try {
            const appId = resolveAppId();
            const res = await ContractService.step2_requestVideo(appId);

            if (res?.success) {
                setVideoStats(prev => ({
                    ...prev,
                    used: prev.used + 1,
                    remaining: Math.max(0, prev.remaining - 1)
                }));
                
                if (triggerDomainSync) triggerDomainSync();

                // 🎥 SIGNALING: Emitir invitación
                if (workflowActions?.invitarAVideo) {
                    workflowActions.invitarAVideo(res.room_url);
                }

                if (onStartVideo) onStartVideo();
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'MAX_VIDEOS') {
                addMessage(`🚫 ${err.message}`, 'system', 'error_alert');
            } else {
                addMessage("❌ Sistema: No autorizado para validación visual.", 'system', 'error_alert');
            }
        } finally {
            setIsInviting(false);
        }
    }, [userRole, isInviting, videoStats, resolveAppId, triggerDomainSync, workflowActions, onStartVideo, addMessage]);

    const registrarValidacionVideo = useCallback(async (duracion) => {
        try {
            const appId = resolveAppId();
            await ContractService.step2_confirmVideo(appId);
            
            // 🎥 SIGNALING: Notificar fin de llamada para que ambos cierren el overlay
            addMessage("Validación Visual Finalizada", 'system', 'video_ended', { duracion });
            
            if (workflowActions?.finalizarValidacion) {
                workflowActions.finalizarValidacion(duracion);
            }
            
            if (triggerDomainSync) triggerDomainSync();
        } catch (e) {
            console.error("Error confirmando video:", e);
        }
    }, [resolveAppId, workflowActions, triggerDomainSync, addMessage]);

    const declinarValidacionVideo = useCallback(() => {
        if (workflowActions?.declinarVideo) {
            workflowActions.declinarVideo();
        }
    }, [workflowActions]);

    return {
        videoStats,
        isInviting,
        invitarAVideo: invitarAVideoWrapper,
        registrarValidacionVideo,
        declinarValidacionVideo
    };
};
