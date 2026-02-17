import { useState, useCallback } from 'react';
import { useChatMessaging } from './useChatMessaging';
import { useChatWorkflow } from './useChatWorkflow';
import { useAuth } from '../../context/AuthContext';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';

// 🏗️ Modular Hooks
import { useChatFinance } from './useChatFinance';
import { useChatProtocol } from './useChatProtocol';
import { useChatSecurity } from './useChatSecurity';
import { useChatPayments } from './useChatPayments';

export const useChatLogic = (candidato, config, userRole, constraints) => {
  const { user } = useAuth();

  // 📱 MOBILE UX
  const [isPanelOpen, setIsPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 1. PROTOCOL & STATE (Source of Truth)
  const {
    permissions,
    contractStatus,
    setContractStatus,
    activeStep // 🆕 Consumed from Protocol
  } = useChatProtocol(candidato, config, constraints);

  // 2. FINANCE
  const finanzas = useChatFinance(candidato, config);

  // 3. MESSAGING & DLP
  const { validateSecurity } = useChatSecurity();

  const { messages, addMessage, clearHistory } = useChatMessaging(
    candidato?.id,
    candidato,
    permissions,
    config
  );

  // 4. WORKFLOW & ACTIONS
  const onSystemMessage = useCallback((text, type, metadata) => {
    addMessage(text, 'system', type, metadata);
  }, [addMessage]);

  const workflow = useChatWorkflow(candidato, onSystemMessage);

  // 5. PAYMENTS
  const { ejecutarPagoComision } = useChatPayments(candidato, finanzas, setContractStatus);

  // --- ACTIONS ---

  const abrirModalPago = useCallback(() => setIsConfirmModalOpen(true), []);

  const enviarMensaje = useCallback((texto) => {
    if (permissions.isReadOnly || !permissions.canWrite) return;

    const securityCheck = validateSecurity(texto);
    if (!securityCheck.valid) {
      addMessage("🚫 Bloqueo de Seguridad: No se permite compartir datos de contacto por este chat. Usa la videollamada.", 'system', 'error_alert');
      return;
    }
    addMessage(texto, 'me');
  }, [permissions.isReadOnly, permissions.canWrite, addMessage, validateSecurity]);

  // --- STEP 2: VIDEO VALIDATION ---
  const registrarValidacionVideo = useCallback(async (duracion) => {
    if (workflow.actions.finalizarValidacion) {
      workflow.actions.finalizarValidacion(duracion);
    }
  }, [workflow.actions]);

  // --- STEP 3: ACUERDO (DB PERSISTENCE) ---
  const ejecutarAcuerdoPersistence = useCallback(async () => {
    // 1. Ejecutar acción del workflow (mensaje)
    const result = await workflow.actions.ejecutarAcuerdo();

    if (result.success && candidato?.id) {
      // 2. Persistencia Real en Base de Datos
      try {
        await ContractService.step3_confirmAgreement(candidato.id);
        setContractStatus(prev => ({ ...prev, step: PROTOCOL_STEPS.AGREEMENT_CONFIRMED }));
        window.dispatchEvent(new CustomEvent('turnes_contract_update'));
      } catch (e) {
        console.error("Error saving agreement:", e);
      }
    }
    return result;
  }, [workflow.actions, candidato, setContractStatus]);

  // --- ORCHESTRATOR EXPORT ---
  return {
    // UI State
    isPanelOpen,
    setIsPanelOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,

    // Domain Data
    messages,
    candidato,
    permisos: permissions,
    finanzas,
    workflowState: workflow.workflowState,
    activeStep, // 🆕 Exposed to UI

    // Status Flags
    isPaid: permissions.isPaid,
    isClosed: permissions.isClosed,

    // Actions
    abrirModalPago,
    ejecutarPagoComision,
    invitarAVideo: workflow.actions.invitarAVideo,
    registrarValidacionVideo,
    declinarValidacionVideo: workflow.actions.declinarVideo,
    ejecutarAcuerdo: ejecutarAcuerdoPersistence,
    enviarMensaje,
    clearHistory
  };
};