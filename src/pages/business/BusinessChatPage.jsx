import React from 'react';
import ChatLoadingSkeleton from '../../components/chat/ChatLoadingSkeleton';
import ChatView from '../../components/chat/ChatView';
import ChatPanels from '../../components/chat/ChatPanels';
import ChatOverlays from '../../components/chat/ChatOverlays';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatLogic } from "../../hooks/chat/useChatLogic";
import { useCandidatosLogic } from '../../hooks/useCandidatosLogic';
import { CandidateService } from '../../services/candidateService';
import { useChatUI } from '../../hooks/chat/useChatUI';

const BusinessChatPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const ui = useChatUI();

    const logic = useCandidatosLogic();
    const [dbContact, setDbContact] = useState(null);

    useEffect(() => {
        const resolveContext = async () => {
            if (!id || !user?.id) return;
            try {
                const fromVacante = location.state?.metadata?.fromVacanteId || null;
                const context = await CandidateService.getChatContext(user.id, id, fromVacante);
                if (context) setDbContact(context);
            } catch (err) {
                console.error("Context Resolution Err", err);
            }
        };
        resolveContext();
    }, [id, user?.id, location.state]);

    const activeEntity = useMemo(() => {
        const { pendientes = [], historial = [] } = logic;
        const lista = [...pendientes, ...historial];
        const found = lista.find(c => String(c.id) === String(id) || String(c.candidateId) === String(id));

        if (found) {
            return {
                ...found,
                otherUserId: found.candidateId || found.user_id || found.id,
            };
        }
        if (dbContact) {
            return {
                ...dbContact,
                // dbContact ya viene normalizado por `normalizeChatContext`:
                // .candidate  → nombre del candidato
                // .avatar / .avatar_url → URL de la foto
                name: dbContact.candidate || 'Candidato',
                avatar: dbContact.avatar || dbContact.avatar_url || dbContact.candidateAvatar || null,
                avatar_url: dbContact.avatar_url || dbContact.avatar || dbContact.candidateAvatar || null,
                otherUserId: dbContact.candidateId || dbContact.user_id,
            };
        }
        return null;
    }, [logic, dbContact, id]);

    // 🚀 CHAT LOGIC WITH REACTIVE UI TRIGGER
    const chat = useChatLogic(
        activeEntity,
        location.state || {},
        'empresa',
        {
            canActivateVideo: logic?.canActivateVideo,
            isVacanteCerrada: !!logic?.isVacanteCerrada
        },
        ui.abrirVideo,
        ui.cerrarVideo
    );

    const hasInjectedGreeting = useRef(false);

    useEffect(() => {
        if (!chat || !activeEntity || hasInjectedGreeting.current || chat.isLoadingProtocol) return;

        const isMatchIntent = location.state?.intent === 'match';
        const hasNoMessages = chat.messages.length === 0;

        if (isMatchIntent && hasNoMessages && user?.id) {
            hasInjectedGreeting.current = true;
            const timer = setTimeout(() => {
                if (chat.inyectarMensajeBienvenida) {
                    chat.inyectarMensajeBienvenida();
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [chat, activeEntity, location.state, user]);

    const handleConfirmarAcuerdo = async () => {
        if (chat?.ejecutarAcuerdo) {
            const result = await chat.ejecutarAcuerdo();
            if (result?.success && logic?.ejecutarAcuerdoFinal) {
                logic.ejecutarAcuerdoFinal(activeEntity?.id);
            }
        }
    };

    const hasValidatedVideo = chat?.workflowState === 'VALIDATED' || chat?.workflowState === 'AGREEMENT_CONFIRMED' || chat?.workflowState === 'COMPLETED';

    const handleVideoInviteClick = () => {
        if (hasValidatedVideo) {
            ui.setIsVideoReinviteModalOpen(true);
        } else {
            chat.invitarAVideo();
        }
    };

    const handleConfirmReinvite = () => {
        ui.setIsVideoReinviteModalOpen(false);
        chat.invitarAVideo();
    };

    if (!user || !activeEntity || !chat) {
        return <ChatLoadingSkeleton />;
    }

    const handleBack = () => navigate('/dashboard/candidatos');

    return (
        <div className="flex h-full w-full overflow-hidden relative font-manrope bg-black">
            <ChatView
                chat={chat}
                candidato={activeEntity}
                isClosed={chat.isClosed}
                onStartVideo={ui.abrirVideo}
                onEjecutarAcuerdo={handleConfirmarAcuerdo}
                onSealChat={chat.sellarChatAction}
                onFinalizeNavigation={handleBack}
                userRole="empresa"
                videoStats={chat.videoStats}
                isPanelOpen={ui.isPanelOpen}
                setIsPanelOpen={ui.setIsPanelOpen}
            />
            <ChatPanels
                chat={chat}
                candidato={activeEntity}
                isClosed={chat.isClosed}
                stats={logic.stats}
                isPaid={chat.isPaid}
                finanzas={chat.finanzas}
                permisos={chat.permisos}
                onPay={chat.ejecutarPagoComision}
                onExecute={handleConfirmarAcuerdo}
                onFinalize={chat.sellarChatAction}
                onVideoInvite={handleVideoInviteClick}
                isPanelOpen={ui.isPanelOpen}
                setIsPanelOpen={ui.setIsPanelOpen}
            />
            <ChatOverlays
                chat={chat}
                candidato={activeEntity}
                isInVideoCall={ui.isInVideoCall}
                setIsInVideoCall={ui.setIsInVideoCall}
                roomUrl={chat.roomUrl}
                isClosed={chat.isClosed}
                isConfirmModalOpen={ui.isConfirmModalOpen}
                setIsConfirmModalOpen={ui.setIsConfirmModalOpen}
                onExecutePayment={chat.ejecutarPagoComision}
                isVideoReinviteModalOpen={ui.isVideoReinviteModalOpen}
                setIsVideoReinviteModalOpen={ui.setIsVideoReinviteModalOpen}
                onConfirmVideoInvite={handleConfirmReinvite}
            />
        </div>
    );
};

export default BusinessChatPage;
