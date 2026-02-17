import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Context & Hooks
import { useAuth } from '../context/AuthContext';
import { useChatLogic } from "../hooks/chat/useChatLogic";
import { useCandidatosLogic } from '../hooks/useCandidatosLogic';

// Components
import { ChatLoadingSkeleton } from '../components/chat/ChatLoadingSkeleton';
import ChatView from '../components/chat/ChatView';
import ChatPanels from '../components/chat/ChatPanels';
import ChatOverlays from '../components/chat/ChatOverlays';

const ChatPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [isInVideoCall, setIsInVideoCall] = useState(false);

  // 2. CONTEXT SWITCHING: Determine Data Source based on Role
  const isBusiness = user?.role === 'empresa';

  // BUSINESS LOGIC
  const logic = useCandidatosLogic();

  // WORKER LOGIC (Simple Local Read)
  const workerContext = useMemo(() => {
    if (isBusiness) return null;
    try {
      const all = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
      return all.find(c => String(c.id) === String(id));
    } catch (e) { return null; }
  }, [id, isBusiness]);

  const navigationState = useMemo(() => {
    if (location.state) return location.state;
    const backup = sessionStorage.getItem(`chat_metadata_${id}`);
    return backup ? JSON.parse(backup) : {};
  }, [location.state, id]);

  // 3. UNIFIED IDENTITY: Resolve the "Partner" (Who are we talking to?)
  const activeEntity = useMemo(() => {
    // A. Business View: Partner is the Candidate
    if (isBusiness) {
      const { pendientes = [], historial = [] } = logic;
      const lista = [...pendientes, ...historial];
      const found = lista.find(c => String(c.id) === String(id));
      return found || { id: id, name: 'Candidato Desconocido' }; // Fallback
    }

    // B. Worker View: Partner is the Company
    // We use the same 'workerContext' (Contract) but we treat it as the session context.
    // However, visually we want to show the COMPANY details, not the candidate details (self).
    if (workerContext) {
      return {
        ...workerContext,
        // Visual Overrides for Chat Header
        name: workerContext.company || "Empresa",
        avatar: workerContext.companyLogo || null,
        roleContext: workerContext.role // e.g. "Mesero"
      };
    }
    return { id: id, name: 'Empresa', roleContext: 'Turno' };
  }, [isBusiness, logic, workerContext, id]);


  // 4. CHAT ENGINE: Inyectamos la identidad resuelta
  const chat = useChatLogic(
    activeEntity,
    navigationState || {},
    user?.role,
    {
      canActivateVideo: isBusiness ? logic?.canActivateVideo : true, // Worker can always join if invited
      isVacanteCerrada: isBusiness ? !!logic?.isVacanteCerrada : false
    }
  );

  const handleConfirmarAcuerdo = async () => {
    if (chat?.ejecutarAcuerdo) {
      const result = await chat.ejecutarAcuerdo();
      if (result?.success && isBusiness && logic?.ejecutarAcuerdoFinal) {
        // Only Business facilitates the final agreement logic in global state
        logic.ejecutarAcuerdoFinal(activeEntity?.id);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsValidating(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // 5. PREVENCIÓN DE CRASH
  if (isValidating || !user || !chat) {
    return <ChatLoadingSkeleton />;
  }

  const handleBack = () => {
    navigate(isBusiness ? '/dashboard/candidatos' : '/dashboard/chats');
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden relative font-manrope">

      <ChatView
        chat={chat}
        candidato={activeEntity} // This is simply the "Partner"
        isClosed={chat.isClosed}
        onStartVideo={() => setIsInVideoCall(true)}
        onEjecutarAcuerdo={handleConfirmarAcuerdo}
        onFinalizeNavigation={handleBack}
        userRole={user?.role} // 🆕
      />

      <ChatPanels
        chat={chat}
        candidato={activeEntity}
        isClosed={chat.isClosed}
        stats={isBusiness ? logic.stats : null} // Hide stats for worker
        isPaid={chat.isPaid}
        finanzas={chat.finanzas}
        permisos={chat.permisos}
        onPay={chat.ejecutarPagoComision}
        onExecute={handleConfirmarAcuerdo}
        onFinalize={handleBack}
        onVideoInvite={chat.invitarAVideo}
      />

      {/* 4. SINCRONIZACIÓN DE OVERLAYS */}
      <ChatOverlays
        chat={chat}
        candidato={activeEntity}
        isInVideoCall={isInVideoCall}
        setIsInVideoCall={setIsInVideoCall}
        isClosed={chat.isClosed}
      />

    </div>
  );
};

export default ChatPage;