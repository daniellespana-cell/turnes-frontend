import { useMemo } from 'react';
import { PROTOCOL_STEPS } from '../../services/contractService';

export const useChatPermissions = (contractStatus, candidatoInfo, isVacanteCerrada = false, isLoadingProtocol = false) => {
  return useMemo(() => {
    // 0. FAIL-SAFE: Si el protocolo aún se está cargando de la DB real, NO damos permisos.
    // Esto previene que se infiltren comandos mientras cargamos.
    if (isLoadingProtocol) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: false,
        isClosed: false,
        reason: 'LOADING_PROTOCOL'
      };
    }

    // 1. Si no hay candidato, bloqueamos.
    if (!candidatoInfo?.id) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: false,
        isClosed: false,
        reason: 'NO_CANDIDATE'
      };
    }

    // --- 2. SOURCE OF TRUTH (BACKEND STATE) ---
    // IGNORAMOS el localStorage. Dependemos estrictamente de lo que dice el servidor.
    const isClosed = Boolean(
      contractStatus.status === 'finalized' ||
      contractStatus.status === 'rechazado' ||
      contractStatus.step >= PROTOCOL_STEPS.FINALIZED
    );
    const isPaid = Boolean(contractStatus.isPaid === true || contractStatus.step >= PROTOCOL_STEPS.PAID);
    const isConfirmed = Boolean(contractStatus.step >= PROTOCOL_STEPS.AGREEMENT_CONFIRMED);

    // PRIORIDAD 1: Si el contrato ya terminó su proceso.
    if (isClosed) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: true,
        isClosed: true,
        reason: 'FINISHED'
      };
    }

    // PRIORIDAD 2: Si la vacante se cerró pero este candidato NO es el ganador, NI ha sido pagado.
    const isRehire = candidatoInfo?.estadoTurno === 'AGENDADO' || candidatoInfo?.type === 'RECONTRATACION_DIRECTA';

    if (isVacanteCerrada && !candidatoInfo.isWinner && !isRehire && !isPaid) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: false,
        isClosed: false,
        reason: 'VACANCY_CLOSED'
      };
    }

    // PRIORIDAD 3: Paso 1 - Esperando Pago en la Billetera.
    if (!isPaid) {
      // En una recontratación, exigimos pago INMEDIATO antes de dejar mandar 1 solo mensaje.
      const isRehireStrict = isRehire;

      return {
        canWrite: !isRehireStrict, // False si es Rehire (Bloqueado), True si es Normal (Negociación P2P)
        isReadOnly: false,
        isPaid: false,
        isClosed: false,
        reason: isRehireStrict ? 'REHIRE_LOCKED_PAYMENT' : 'WAITING_PAYMENT',
        confirmado: false
      };
    }

    // PRIORIDAD 4: Chat Activo y Pagado (Pasos 2, 3 y 4 del Protocolo)
    return {
      canWrite: true,
      isReadOnly: false,
      isPaid: true,
      isClosed: false,
      reason: 'ACTIVE',
      confirmado: isConfirmed
    };

  }, [
    contractStatus.status,
    contractStatus.step,
    contractStatus.isPaid,
    candidatoInfo?.id,
    candidatoInfo?.estadoTurno,
    candidatoInfo?.type,
    candidatoInfo?.isWinner,
    isVacanteCerrada,
    isLoadingProtocol
  ]);
};