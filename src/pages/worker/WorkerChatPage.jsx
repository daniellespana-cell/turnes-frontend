import React from 'react';
import ChatLoadingSkeleton from '../../components/chat/ChatLoadingSkeleton';
import ChatView from '../../components/chat/ChatView';
import ChatPanels from '../../components/chat/ChatPanels';
import ChatOverlays from '../../components/chat/ChatOverlays';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatLogic } from "../../hooks/chat/useChatLogic";
import { CandidateService } from '../../services/candidateService';
import { useChatUI } from '../../hooks/chat/useChatUI';
import { ChatStorage } from '../../services/chat';

const WorkerChatPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const ui = useChatUI(); // 🚀 UI Hook

    const [dbContact, setDbContact] = useState(null);
    const chatSnapshot = useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot);

    useEffect(() => {
        const resolveContext = async () => {
            if (!id || !user?.id) return;
            try {
                const context = await CandidateService.getChatContext(user.id, id);
                if (context) setDbContact(context);
            } catch (err) {
                console.error("Context Resolution Err", err);
            }
        };
        resolveContext();
    }, [id, user?.id]);
    
    const activeEntity = useMemo(() => {
        // 1. Resolver desde el store reactivo de ChatStorage en 0ms
        const conv = chatSnapshot?.conversations?.[id];
        if (conv) {
            return {
                id: conv.id,
                name: conv.empresa?.nombre_comercial || "Empresa",
                avatar: conv.empresa?.logo_url || null,
                company: conv.empresa?.nombre_comercial || "Empresa",
                companyAvatar: conv.empresa?.logo_url || null,
                companyId: conv.empresa_id || conv.companyId,
                otherUserId: conv.otherUserId || conv.empresa_id,
                status: conv.status,
                step: conv.step,
                isClosed: ['finalizado', 'rechazado'].includes(conv.status) || conv.step === 4,
                protocol_state: conv.protocol_state,
                vacante: conv.vacante,
                payment: conv.payment ?? conv.vacante?.pago_monto ?? 0,
                role: conv.role ?? conv.vacante?.titulo ?? "Vacante",
                roleContext: conv.roleContext ?? conv.vacante?.titulo ?? "Vacante"
            };
        }

        // 2. Si no, usar dbContact resuelto
        if (dbContact) {
            // 🛡️ IDENTIDAD DEL INTERLOCUTOR (Empresa)
            return {
                ...dbContact,
                name: dbContact.company || dbContact.nombre_comercial || "Empresa",
                avatar: dbContact.companyAvatar || dbContact.logo_url || null,
                otherUserId: dbContact.companyId,
            };
        }
        return null;
    }, [chatSnapshot?.conversations, dbContact, id]);

    // 🚀 CHAT LOGIC WITH REACTIVE UI TRIGGER
    const chat = useChatLogic(
        activeEntity,
        location.state || {},
        'trabajador',
        {
            canActivateVideo: true,
            isVacanteCerrada: activeEntity?.cicloCerrado
        },
        ui.abrirVideo,
        ui.cerrarVideo
    );

    if (!user || !activeEntity || !chat) {
        return <ChatLoadingSkeleton />;
    }

    const handleBack = () => navigate('/dashboard/vacantes');

    return (
        <div className="flex h-full w-full overflow-hidden relative font-manrope">
            <ChatView
                chat={chat}
                candidato={activeEntity}
                isClosed={chat.isClosed}
                onStartVideo={ui.abrirVideo}
                onEjecutarAcuerdo={chat.ejecutarAcuerdo}
                onSealChat={chat.sellarChatAction}
                onFinalizeNavigation={handleBack}
                userRole="trabajador"
                videoStats={chat.videoStats}
                isPanelOpen={ui.isPanelOpen}
                setIsPanelOpen={ui.setIsPanelOpen}
            />
            <ChatPanels
                chat={chat}
                candidato={activeEntity}
                isClosed={chat.isClosed}
                stats={null}
                isPaid={chat.isPaid}
                finanzas={chat.finanzas}
                permisos={chat.permisos}
                onPay={chat.ejecutarPagoComision}
                onExecute={chat.ejecutarAcuerdo}
                onFinalize={chat.sellarChatAction}
                onVideoInvite={chat.invitarAVideo}
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
            />
        </div>
    );
};

export default WorkerChatPage;
