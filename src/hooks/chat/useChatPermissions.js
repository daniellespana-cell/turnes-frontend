import { useMemo } from 'react';

export const useChatPermissions = (candidato, metadata = {}, isVacanteCerrada = false) => {
  return useMemo(() => {
    // 1. REGLA PRINCIPAL: Un chat NUNCA está cerrado a menos que el estadoTurno sea 'FINALIZADO'
    const isClosed = Boolean(
      candidato?.estadoTurno === 'FINALIZADO' ||
      candidato?.cicloCerrado
    );

    // 2. Si no hay candidato, devolvemos un estado seguro
    if (!candidato?.id) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: false,
        isClosed: false,
        reason: 'LOADING'
      };
    }

    // 3. DEFINICIÓN DE PAGO (Directo del objeto candidato)
    // 3. DEFINICIÓN DE PAGO (Directo del objeto candidato)
    // ⚠️ SEGURIDAD: Solo 'isPaid' determina si se pagó. VideoHabilitado o Validado son estados de servicio, no de finanzas.
    const isPaid = Boolean(
      candidato.isPaid === true
    );

    // 4. LÓGICA DE PRIORIDADES

    // PRIORIDAD 1: Si el candidato ya terminó su proceso.
    if (isClosed) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: true,
        isClosed: true,
        reason: 'FINISHED'
      };
    }

    // PRIORIDAD 2: Si la vacante se cerró pero este candidato NO es el ganador.
    // 🔥 FIX: Si es una RECONTRATACIÓN ('AGENDADO'), ignoramos el cierre de vacante
    // porque ahora es un trato directo, sin vacante de por medio.
    const isRehire = candidato?.estadoTurno === 'AGENDADO';

    if (isVacanteCerrada && !candidato.isWinner && !isRehire) {
      return {
        canWrite: false,
        isReadOnly: true,
        isPaid: isPaid,
        isClosed: false, // Ojo: lo marcamos como no-cerrado para que no salga "Archived" si no "Locked"
        reason: 'VACANCY_CLOSED'
      };
    }

    // PRIORIDAD 3: Paso 1 - Esperando Pago.
    // ⚠️ REGLA DE PAGOS:
    // - Flujo Normal: Pueden hablar antes de pagar (Negotiation)
    // - Re-hire: EL JEFE DEBE PAGAR PARA DESBLOQUEAR EL CHAT (Strict Block)
    if (!isPaid) {
      // Re-hire detection:
      const isRehireStrict = candidato?.estadoTurno === 'AGENDADO' || metadata?.intent === 'RECONTRATACION_DIRECTA';

      return {
        canWrite: !isRehireStrict,        // 🔒 False si es Rehire, True si es Normal
        isReadOnly: false,
        isPaid: false,
        isClosed: false,
        reason: isRehireStrict ? 'REHIRE_LOCKED_PAYMENT' : 'WAITING_PAYMENT'
      };
    }

    // PRIORIDAD 4: Chat Activo y Pagado (Pasos 2, 3 y 4)
    return {
      canWrite: true,
      isReadOnly: false,
      isPaid: true,
      isClosed: false,
      reason: 'ACTIVE',
      confirmado: candidato?.estadoTurno === 'EJECUTADO'
    };

  }, [
    candidato?.id,
    candidato?.isPaid,
    candidato?.estadoTurno,
    candidato?.cicloCerrado,
    candidato?.videoHabilitado,
    candidato?.isWinner,
    isVacanteCerrada,
    metadata?.unlocked
  ]);
};