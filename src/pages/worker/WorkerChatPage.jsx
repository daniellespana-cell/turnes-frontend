import React from 'react';
import ChatLoadingSkeleton from '../../components/chat/ChatLoadingSkeleton';
import ChatView from '../../components/chat/ChatView';
import ChatPanels from '../../components/chat/ChatPanels';
import ChatOverlays from '../../components/chat/ChatOverlays';

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatLogic } from "../../hooks/chat/useChatLogic";
import { useVacantesLogic } from '../../hooks/useVacantesLogic';
import { CandidateService } from '../../services/candidateService';
import { useChatUI } from '../../hooks/chat/useChatUI';

const WorkerChatPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const ui = useChatUI(); // 🚀 UI Hook

    const [dbContact, setDbContact] = useState(null);

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

    const logic = useVacantesLogic();
    
    const activeEntity = useMemo(() => {
        const { aplicadas = [] } = logic;
        const found = aplicadas.find(v => String(v.applicationId) === String(id) || String(v.id) === String(id));
        
        if (found) {
            return {
                ...found,
                otherUserId: found.companyId || found.empresaId || found.vacante?.empresa_id,
            };
        }
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
    }, [logic, dbContact, id]);

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
                stats={logic.stats}
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
