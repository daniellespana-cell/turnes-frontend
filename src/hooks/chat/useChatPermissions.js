import { useMemo } from 'react';
import { PROTOCOL_STEPS } from '../../services/contractService';

export const useChatPermissions = (contractStatus, candidatoInfo, isVacanteCerrada = false, isLoadingProtocol = false) => {
  return useMemo(() => {
    // 0. ESTADOS DE EXCEPCIÓN (Carga, Sin Candidato, Cancelado, Vacante Cerrada sin match)
    if (isLoadingProtocol) {
      return { canWrite: false, isReadOnly: true, isPaid: false, isClosed: false, reason: 'LOADING_PROTOCOL' };
    }
    if (!candidatoInfo?.id) {
      return { canWrite: false, isReadOnly: true, isPaid: false, isClosed: false, reason: 'NO_CANDIDATE' };
    }
    
    const isCanceled = ['rechazada', 'rechazado', 'cancelada'].includes(contractStatus.status);
    if (isCanceled) {
      return { canWrite: false, isReadOnly: true, isPaid: false, isClosed: true, reason: 'CANCELED' };
    }

    const isRehire = candidatoInfo?.estadoTurno === 'AGENDADO' || candidatoInfo?.type === 'RECONTRATACION_DIRECTA';
    const step = contractStatus.step || 0;

    // Si la vacante cerró y no ganaste, chao (A menos que ya esté pagado o sea recontratación)
    if (isVacanteCerrada && !candidatoInfo.isWinner && !isRehire && step < PROTOCOL_STEPS.PAID) {
      return { canWrite: false, isReadOnly: true, isPaid: false, isClosed: false, reason: 'VACANCY_CLOSED' };
    }

    // 1. MAQUINA DE ESTADOS PLANA (SSOT absoluto basado en el paso)
    switch (step) {
      case PROTOCOL_STEPS.FINALIZED:
        return { canWrite: false, isReadOnly: true, isPaid: true, isClosed: true, reason: 'FINISHED', confirmado: true };

      case PROTOCOL_STEPS.AGREEMENT_CONFIRMED:
        return { canWrite: true, isReadOnly: false, isPaid: true, isClosed: false, reason: 'ACTIVE', confirmado: true };

      case PROTOCOL_STEPS.VIDEO_VALIDATED:
      case PROTOCOL_STEPS.PAID:
        return { canWrite: true, isReadOnly: false, isPaid: true, isClosed: false, reason: 'ACTIVE', confirmado: false };

      case PROTOCOL_STEPS.APPLIED:
      default:
        // En Paso 0 (Awaiting Payment), solo bloqueamos escritura si es Rehire estricto.
        return {
          canWrite: !isRehire,
          isReadOnly: false,
          isPaid: false,
          isClosed: false,
          reason: isRehire ? 'REHIRE_LOCKED_PAYMENT' : 'WAITING_PAYMENT',
          confirmado: false
        };
    }
  }, [
    contractStatus.status,
    contractStatus.step,
    candidatoInfo?.id,
    candidatoInfo?.estadoTurno,
    candidatoInfo?.type,
    candidatoInfo?.isWinner,
    isVacanteCerrada,
    isLoadingProtocol
  ]);
};