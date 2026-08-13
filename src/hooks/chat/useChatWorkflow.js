import { useCallback, useMemo } from 'react';

export const useChatWorkflow = (candidato, onSystemMessage, userRole) => {

  // 1. ESTADOS DERIVADOS
  const workflowState = useMemo(() => {
    if (!candidato) return 'IDLE';
    if (candidato.cicloCerrado || candidato.estadoTurno === 'FINALIZADO') return 'COMPLETED';
    if (candidato.estadoTurno === 'EJECUTADO' || candidato.estadoTurno === 'AGENDADO') return 'AGREEMENT_CONFIRMED';
    if (candidato.videoHabilitado || candidato.estadoTurno === 'VALIDADO') return 'VALIDATED';
    return 'IDLE';
  }, [candidato?.estadoTurno, candidato?.videoHabilitado, candidato?.cicloCerrado]);

  // 2. ACCIONES DEL PROTOCOLO

  // --- PASO 2: INVITACIÓN ---
  const invitarAVideo = useCallback((roomUrl) => {
    onSystemMessage(
      'Solicitud de Validación Visual',
      'video_invitation',
      {
        subtype: 'video_invite',
        status: 'pending',
        roomUrl: roomUrl,
        instruction: userRole === 'trabajador'
          ? 'El jefe desea conocerte brevemente. Tómate un momento y acepta cuando estés listo.'
          : 'Esperando a que el candidato acepte la invitación. Una vez acepte, iniciaremos la conexión.',
        timestamp: new Date().toISOString()
      }
    );
    return { action: 'VIDEO_INVITE_SENT' };
  }, [onSystemMessage, userRole]);

  // SEÑALIZACIÓN: Aceptar Invitación
  // Solo emite el mensaje de red. La apertura del overlay la maneja el evento de dominio.
  const aceptarInvitacionVideo = useCallback((roomUrl) => {
    onSystemMessage(
      'Cámara Activa',
      'video_accepted',
      { 
        roomUrl: roomUrl,
        timestamp: new Date().toISOString() 
      }
    );
    // Evento de dominio: las páginas escuchan esto para abrir el overlay
    window.dispatchEvent(new CustomEvent('turnes_video_open'));
  }, [onSystemMessage]);

  const finalizarValidacion = useCallback((duracionString) => {
    onSystemMessage(
      userRole === 'trabajador' ? 'Validación Completada' : 'Has completado la Validación',
      'video_ended',
      {
        subtype: 'call_summary',
        duration: duracionString || '00:00',
        nextStepHint: userRole === 'trabajador'
          ? 'Excelente. Espera a que la empresa emita el acuerdo.'
          : 'Excelente. Ya puedes proceder a firmar el acuerdo con el candidato.',
        timestamp: new Date().toISOString()
      },
      userRole === 'empresa' ? 'prompt_contract' : null
    );
    return { action: 'VIDEO_COMPLETED' };
  }, [onSystemMessage, userRole]);

  const declinarVideo = useCallback(() => {
    onSystemMessage(
      'Validación declinada',
      'system_error',
      { subtype: 'video_declined', text: 'El postulante no puede conectarse ahora.' }
    );
    return { action: 'VIDEO_DECLINED' };
  }, [onSystemMessage]);

  // --- PASO 3: ACUERDO ---
  const ejecutarAcuerdo = useCallback(async () => {
    try {
      const txId = Math.random().toString(36).substr(2, 9).toUpperCase();
      onSystemMessage(
        userRole === 'trabajador' ? '🎉 ¡FELICITACIONES! HAS SIDO SELECCIONADO' : '📄 ACUERDO EMITIDO Y FIRMADO',
        'contract_signed',
        {
          timestamp: new Date().toISOString(),
          txId: txId,
          digitalSignature: `SIG-${txId}`,
          instruction: userRole === 'trabajador'
            ? `El turno ha sido confirmado oficialmente. Por favor preséntate puntualmente según lo acordado.`
            : `El acuerdo ha sido formalizado y la vacante cubierta. Notificado al candidato.`,
          amount: candidato?.payment || 0
        }
      );
      return { success: true, txId };
    } catch (error) {
      console.error("Error acuerdo:", error);
      return { success: false };
    }
  }, [onSystemMessage, candidato?.payment, userRole]);

  return {
    workflowState,
    actions: {
      invitarAVideo,
      aceptarInvitacionVideo,
      finalizarValidacion,
      declinarVideo,
      ejecutarAcuerdo
    }
  };
};