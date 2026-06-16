import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatMessaging } from './useChatMessaging';
import { useChatWorkflow } from './useChatWorkflow';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UI_STRINGS } from '../../domain/uiTranslations';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';

// 🏗️ Modular Hooks
import { useChatFinance } from './useChatFinance';
import { useChatProtocol } from './useChatProtocol';
import { useChatSecurity } from './useChatSecurity';
import { useChatPayments } from './useChatPayments';
import { useChatVideo } from './useChatVideo';
import { useChatRehire } from './useChatRehire';

export const useChatLogic = (candidato, config, userRole, constraints, onStartVideo, onCerrarVideo) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 1. PROTOCOL & STATE (Source of Truth)
  const {
    permissions,
    contractStatus,
    setContractStatus,
    activeStep,
    isLoadingProtocol
  } = useChatProtocol(candidato, config, constraints);

  // 2. FINANCE
  const finanzas = useChatFinance(candidato);

  // 3. MESSAGING & DLP
  const { validateSecurity } = useChatSecurity();

  const { messages, addMessage, clearHistory } = useChatMessaging(
    candidato?.id,
    candidato,
    permissions,
    config
  );

  // 4. WORKFLOW & ACTIONS
  const onSystemMessage = useCallback((text, type, metadata, promptType) => {
    addMessage(text, 'system', promptType || type, metadata);
  }, [addMessage]);

  const workflow = useChatWorkflow(candidato, onSystemMessage, userRole);

  // 🆕 ROOM URL RESOLUTION: Modo Test Activo con sala real de Daily.co
  const roomUrl = useMemo(() => {
    return "https://turnes.daily.co/test-room";
  }, []);

  // 🆕 SYNC SENSOR: Sincronización de apertura/cierre reactiva via Realtime
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    // Abrir cuando se acepta
    if (lastMsg.type === 'video_accepted' && onStartVideo) {
        onStartVideo();
    }

    // Cerrar cuando finaliza la validación (Hangup Signaling)
    if (lastMsg.type === 'video_ended' && onCerrarVideo) {
        onCerrarVideo();
    }
  }, [messages, onStartVideo, onCerrarVideo]);

  // 5. PAYMENTS
  const { ejecutarPagoComision, isPaying } = useChatPayments(candidato, finanzas, setContractStatus, onSystemMessage);

  // 🛡️ UUID SHIELD
  const resolveAppId = useCallback(() => {
    const appId = candidato?.applicationId || candidato?.id;
    if (!appId) throw new Error("CRITICAL_DOMAIN_ERROR: Missing valid Application UUID for RPC operation.");
    return appId;
  }, [candidato]);

  const triggerDomainSync = useCallback(() => {
    window.dispatchEvent(new CustomEvent('turnes_contract_update'));
  }, []);

  // --- ACTIONS ---
  const inyectarMensajeBienvenida = useCallback(() => {
      onSystemMessage(
        'Conexión Segura Establecida',
        'system_info',
        {
          subtype: 'chat_created',
          instruction: userRole === 'trabajador' 
              ? 'Has hecho match. La empresa evaluará tu perfil. Responde a sus mensajes para avanzar en el proceso.' 
              : 'Match exitoso con el talento. Entrevista por este medio y luego procede con el Paso 1 (Pago de Comisión) para desbloquear los datos directos y validación en video.',
          timestamp: new Date().toISOString()
        }
      );
  }, [onSystemMessage, userRole]);

  const enviarMensaje = useCallback((texto) => {
    if (permissions.isReadOnly || !permissions.canWrite) return;
    const securityCheck = validateSecurity(texto);
    if (!securityCheck.valid) {
      addMessage("🚫 Bloqueo de Seguridad: No se permite compartir datos de contacto por este chat. Usa la videollamada.", 'system', 'error_alert');
      return;
    }
    addMessage(texto, 'me');
  }, [permissions.isReadOnly, permissions.canWrite, addMessage, validateSecurity]);

  // --- DOMAINS ---
  const { videoStats, invitarAVideo, registrarValidacionVideo, declinarValidacionVideo } = useChatVideo({
    candidato,
    userRole,
    resolveAppId,
    workflowActions: {
        ...workflow.actions,
        invitarAVideo: () => workflow.actions.invitarAVideo(roomUrl) // 🛡️ FORCE TEST ROOM URL
    },
    addMessage,
    triggerDomainSync,
    onStartVideo,
    onCerrarVideo,
    isPaid: permissions.isPaid
  });

  const { onAcceptRehire, onDeclineRehire } = useChatRehire({ resolveAppId, triggerDomainSync });

  // --- PERSISTENCE ---
  const ejecutarAcuerdoPersistence = useCallback(async () => {
    const appId = candidato?.applicationId || candidato?.id;
    if (!appId) return { success: false };
    try {
      await ContractService.step3_confirmAgreement(appId);
      const result = await workflow.actions.ejecutarAcuerdo();
      setContractStatus(prev => ({ ...prev, step: PROTOCOL_STEPS.AGREEMENT_CONFIRMED }));
      triggerDomainSync();
      return result;
    } catch (e) {
      console.error("Error saving agreement:", e);
      showToast(UI_STRINGS.CHAT.AGREEMENT_ERROR, "error");
      throw e;
    }
  }, [workflow.actions, candidato, setContractStatus, triggerDomainSync, showToast]);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const sellarChatAction = useCallback(async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    try {
      const appId = resolveAppId();
      await ContractService.step4_sealChat(appId);
      setContractStatus(prev => ({ ...prev, step: PROTOCOL_STEPS.FINALIZED, status: 'contratado' }));
      triggerDomainSync();
      showToast(UI_STRINGS.CHAT.SEALED_SUCCESS, "success");
      navigate('/candidatos');
    } catch (e) {
      console.error("Error al sellar chat:", e);
      showToast(`Error de Sellado: ${e.message || 'No se pudo cerrar la bóveda.'}`, "error");
    } finally {
      setIsFinalizing(false);
    }
  }, [candidato, setContractStatus, isFinalizing, resolveAppId, triggerDomainSync, navigate]);

  return {
    isLoadingProtocol,
    isFinalizing,
    messages,
    candidato,
    permisos: permissions,
    finanzas,
    workflowState: workflow.workflowState,
    activeStep,
    videoStats,
    roomUrl,
    isPaid: permissions.isPaid,
    isClosed: permissions.isClosed,
    isPaying,
    ejecutarPagoComision,
    invitarAVideo,
    aceptarInvitacionVideo: workflow.actions.aceptarInvitacionVideo,
    registrarValidacionVideo,
    declinarValidacionVideo: workflow.actions.declinarVideo,
    ejecutarAcuerdo: ejecutarAcuerdoPersistence,
    sellarChatAction,
    onAcceptRehire,
    onDeclineRehire,
    enviarMensaje,
    enviarRompehielos: (texto) => addMessage(texto, 'me'),
    inyectarMensajeBienvenida, // 🛡️ RESTAURADO
    clearHistory
  };
};