
const ChatView = ({
  chat,
  candidato,
  isClosed: isClosedFromPage, // Renombramos para claridad
  onStartVideo,
  onEjecutarAcuerdo, // Paso 3 (Lógica)
  onSealChat, // Paso 4 (Red Confianza)
  onFinalizeNavigation, // Paso 4 (Navegación)
  userRole, // 🆕
  videoStats, // 🆕
  isPanelOpen,
  setIsPanelOpen
}) => {

  const {
    messages = [],
    enviarMensaje,
    invitarAVideo,
    aceptarInvitacionVideo, // 🆕
    isPaid = false,
    declinarValidacionVideo,
    ejecutarAcuerdo,
    onAcceptRehire,
    onDeclineRehire,
    permisos // Extraemos permisos para tener el 'reason' y 'canWrite'
  } = chat || {};

  /**
   * ✅ CORRECCIÓN DE LÓGICA DE ESTADO
   * Un chat está "Cerrado" SOLO si el ciclo terminó (Paso 5).
   * Si no se ha pagado (Paso 1), NO está cerrado, está "Pendiente".
   */
  /**
   * ✅ CORRECCIÓN DE LÓGICA DE ESTADO
   * Un chat está "Cerrado" SOLO si el ciclo terminó Y no hay un proceso de recontratación activo.
   */
  const isRehireActive = ['AGENDADO', 'VALIDADO', 'EJECUTADO'].includes(candidato?.estadoTurno);

  const realIsClosed = !isRehireActive && Boolean(
    isClosedFromPage ||
    candidato?.cicloCerrado ||
    candidato?.estadoTurno === 'FINALIZADO' ||
    permisos?.reason === 'FINISHED'
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 relative h-full">

      {/* HEADER: Recibe el estado real de clausura */}
      <ChatHeader
        candidate={candidato}
        onToggleSidebar={() => setIsPanelOpen(!isPanelOpen)}
        onVideoInvite={invitarAVideo}
        isPaid={isPaid}
        isClosed={realIsClosed}
        userRole={userRole}
        videoStats={videoStats}
      />

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black">
        <MessageList
          messages={messages}
          onStartVideo={onStartVideo}
          onDeclineVideo={declinarValidacionVideo}
          // 🧠 LÓGICA SEPARADA
          onExecute={onEjecutarAcuerdo || ejecutarAcuerdo}
          onFinalize={onFinalizeNavigation}
          onSealChat={onSealChat}
          // 🚀 ULTRA UX: Pasar la función para invitar desde el chat
          onInviteVideo={invitarAVideo}
          aceptarInvitacionVideo={aceptarInvitacionVideo}
          onAcceptRehire={onAcceptRehire}
          onDeclineRehire={onDeclineRehire}
          candidato={candidato}
          activeStep={chat?.activeStep}
          // Pasamos flags para que MessageList sepa qué cartel mostrar
          isPaid={isPaid}
          isClosed={realIsClosed}
          // 🆕 PROPS PARA MOBILE DASHBOARD
          finanzas={chat?.finanzas}
          permisos={chat?.permisos}
          onPay={chat?.ejecutarPagoComision}
          isFinalizing={chat?.isFinalizing}
          userRole={userRole}
        />
      </div>

      {/* INPUT: Se bloquea si está cerrado O si no se ha pagado */}
      <div className="w-full relative z-10">
        <ChatInput
          onSend={enviarMensaje}
          isPaid={isPaid}
          // Pasamos canWrite para habilitar input aunque no se haya pagado
          canWrite={permisos?.canWrite}
          isClosed={realIsClosed}
          userRole={userRole} // 🆕
          isContracted={candidato?.status === 'contratado'}
          isRehire={isRehireActive} // 🆕 FAST-TRACK Context
        />
      </div>

      {/* Indicador visual: Solo si no está cerrado y ya se pagó */}
      {isPaid && !realIsClosed && (
        <div className="absolute top-20 right-6 pointer-events-none opacity-20 hidden md:block">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em]">Enlace Directo Activo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;