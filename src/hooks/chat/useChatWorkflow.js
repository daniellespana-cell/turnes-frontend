import { useState, useCallback, useMemo } from 'react';

export const useChatWorkflow = (candidato, onSystemMessage) => {
  const [isInVideoCall, setIsInVideoCall] = useState(false);

  // 1. ESTADOS DERIVADOS
  const workflowState = useMemo(() => {
    if (!candidato) return 'IDLE';
    // Prioridades de estado (de final a inicial)
    if (candidato.cicloCerrado || candidato.estadoTurno === 'FINALIZADO') return 'COMPLETED';
    if (candidato.estadoTurno === 'EJECUTADO' || candidato.estadoTurno === 'AGENDADO') return 'AGREEMENT_CONFIRMED';
    if (candidato.videoHabilitado || candidato.estadoTurno === 'VALIDADO') return 'VALIDATED';
    return 'IDLE';
  }, [candidato?.estadoTurno, candidato?.videoHabilitado, candidato?.cicloCerrado]);

  // 2. ACCIONES DEL PROTOCOLO

  // --- PASO 2: INVITACIÓN (Solo Mensaje) ---
  const invitarAVideo = useCallback(() => {
    // 1. Enviamos la burbuja con los botones de acción
    onSystemMessage(
      'Solicitud de Validación Visual',
      'video_invitation',
      {
        subtype: 'video_invite',
        status: 'pending',
        instruction: 'El jefe desea conocerte brevemente. Tómate un momento y acepta cuando estés listo.',
        timestamp: new Date().toISOString()
      }
    );

    // 2. IMPORTANTE: NO activamos setIsInVideoCall(true) aquí.
    // La cámara solo se abre cuando el usuario da clic en "Aceptar" dentro de la burbuja del chat.
    console.log("Protocolo: Invitación emitida al chat");

    return { action: 'VIDEO_INVITE_SENT' };
  }, [onSystemMessage]);

  const finalizarValidacion = useCallback((duracionString) => {
    onSystemMessage(
      'Validación Completada',
      'system_info',
      {
        subtype: 'call_summary',
        duration: duracionString || '00:00',
        nextStepHint: 'Excelente. Ya puedes proceder a firmar el acuerdo.',
        timestamp: new Date().toISOString()
      },
      // 🚀 ULTRA UX: Prompt Proactivo para firmar contrato
      // Esto genera la burbuja "Formalizar Acuerdo" con botón
      'prompt_contract'
    );
    return { action: 'VIDEO_COMPLETED' };
  }, [onSystemMessage]);

  const declinarVideo = useCallback(() => {
    onSystemMessage(
      'Validación declinada',
      'system_error',
      { subtype: 'video_declined', text: 'El postulante no puede conectarse ahora.' }
    );
    return { action: 'VIDEO_DECLINED' };
  }, [onSystemMessage]);

  // --- PASO 3: ACUERDO (Mensaje de Celebración) ---
  const ejecutarAcuerdo = useCallback(async () => {
    try {
      const txId = Math.random().toString(36).substr(2, 9).toUpperCase();

      onSystemMessage(
        '🎉 ¡FELICITACIONES! HAS SIDO SELECCIONADO',
        'contract_signed',
        {
          timestamp: new Date().toISOString(),
          txId: txId,
          digitalSignature: `SIG-${txId}`,
          instruction: `El turno ha sido confirmado oficialmente. Por favor preséntate puntualmente según lo acordado.`,
          amount: candidato?.payment || 0
        }
      );

      console.log(`Protocolo: Acuerdo registrado [TX-${txId}]`);
      return { success: true, txId };
    } catch (error) {
      console.error("Error acuerdo:", error);
      return { success: false };
    }
  }, [onSystemMessage, candidato?.payment]);

  return {
    workflowState,
    isInVideoCall,
    setIsInVideoCall, // Se expone para que el botón "Aceptar" del chat pueda usarlo
    actions: {
      invitarAVideo,
      finalizarValidacion,
      declinarVideo,
      ejecutarAcuerdo
    }
  };
};