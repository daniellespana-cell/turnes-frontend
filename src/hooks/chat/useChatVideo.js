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
    _cerrarVideo, // 🆕 Necesitamos cerrar el overlay localmente
    isPaid
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
    }, [userRole, candidato?.applicationId, candidato?.id, resolveAppId]);

    // --- ACCIÓN: INVITAR A VIDEO (ATÓMICO RPC) ---
    const invitarAVideoWrapper = useCallback(async () => {
        if (userRole !== 'empresa' || isInviting) return;
        if (!isPaid) return; // Doble candado

        if (videoStats.remaining <= 0) {
            if (workflowActions?.solicitarRecarga) {
                workflowActions.solicitarRecarga();
            }
            return;
        }

        setIsInviting(true);
        try {
            const appId = resolveAppId();
            const { success, roomUrl, error: rpcError } = await ContractService.step2_requestVideo(appId);

            if (!success) {
                console.error("Fallo al invitar a video (RPC):", rpcError);
                return;
            }

            // Actualizar stats locales
            setVideoStats(prev => ({
                ...prev,
                used: prev.used + 1,
                remaining: Math.max(0, prev.remaining - 1)
            }));

            // Iniciar llamada localmente
            if (onStartVideo) {
                onStartVideo(roomUrl);
            }

            // Emitir mensaje del sistema al chat para que el postulante reciba los botones Aceptar/Declinar
            if (workflowActions?.invitarAVideo) {
                workflowActions.invitarAVideo(roomUrl);
            }

            if (triggerDomainSync) triggerDomainSync();

        } catch (err) {
            console.error("Error general invitando a video:", err);
            if (addMessage) {
                addMessage("❌ Sistema: No autorizado para validación visual.", 'system', 'error_alert');
            }
        } finally {
            setIsInviting(false);
        }
    }, [userRole, isInviting, isPaid, videoStats, resolveAppId, triggerDomainSync, workflowActions, onStartVideo, addMessage]);

    const registrarValidacionVideo = useCallback(async (duracion) => {
        try {
            const appId = resolveAppId();
            await ContractService.step2_confirmVideo(appId);
            
            // 🎥 SIGNALING: Notificar fin de llamada para que ambos cierren el overlay
            // 🚀 SENIOR FIX: Eliminada inyección de BD desde UI. El backend lo hace ahora, 
            // el socket lo distribuirá para cerrar el video de todos.
            
            if (workflowActions?.finalizarValidacion) {
                workflowActions.finalizarValidacion(duracion);
            }
            
            if (triggerDomainSync) triggerDomainSync();
        } catch (e) {
            console.error("Error confirmando video:", e);
        }
    }, [resolveAppId, workflowActions, triggerDomainSync]);

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
