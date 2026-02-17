import React from 'react';
import { createPortal } from 'react-dom';
import { ContractSidebar } from './ContractSidebar';

const ChatPanels = ({
  chat,
  candidato,
  fromVacante,
  isClosed,
  stats,
  onPay,
  onExecute,
  onFinalize, // Agregado: Paso 4
  onVideoInvite
}) => {
  // 1. DESESTRUCTURACIÓN SEGURA: Fallbacks inmediatos para evitar el "nada"
  const {
    isPanelOpen = true,
    setIsPanelOpen = () => { },
    finanzas = {},
    isPaid = false,
    permisos = {}
  } = chat || {};

  // 2. SINCRONIZACIÓN DE PERMISOS: Si no hay permisos del hook, 
  // construimos un objeto de emergencia para que el Sidebar NO se rompa.
  const effectivePermisos = {
    isPaid: isPaid || permisos?.isPaid || candidato?.isPaid,
    puedeVideo: permisos?.puedeVideo || isPaid,
    promise: permisos?.confirmado || candidato?.estadoTurno === 'EJECUTADO', // Removed AGENDADO to prevent skip to Step 4
    isClosed: isClosed || permisos?.isClosed || candidato?.cicloCerrado,
    ...permisos
  };

  const sidebarProps = {
    candidate: candidato,
    fromVacante,
    finanzas: finanzas || candidato?.billingConfig || {},
    permisos: effectivePermisos,
    onPay: onPay || chat?.abrirModalPago,
    onExecute: onExecute || chat?.ejecutarAcuerdo, // Paso 3
    onFinalize: onFinalize,                         // Paso 4
    onVideoInvite: onVideoInvite || chat?.invitarAVideo,
    onClose: () => setIsPanelOpen(false),
    stats
  };

  // 3. RENDERIZADO ESTRUCTURAL: No usamos "return null" para evitar parpadeos.
  // Usamos clases de CSS para ocultar, manteniendo el componente vivo.
  return (
    <>
      {/* VERSIÓN DESKTOP */}
      <aside className={`hidden lg:block border-l border-white/5 transition-all duration-500 overflow-hidden h-full ${isPanelOpen ? 'w-80 xl:w-96 opacity-100' : 'w-0 opacity-0'
        }`}>
        {isPanelOpen && <ContractSidebar {...sidebarProps} />}
      </aside>

      {/* VERSIÓN MÓVIL (Bottom Sheet) - PORTAL PARA EVITAR Z-INDEX TRAP */}
      {isPanelOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] animate-in fade-in duration-300 font-manrope">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setIsPanelOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 z-[110] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 z-[120] py-4 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-xl rounded-t-[3rem]">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto absolute left-0 right-0 md:hidden" />
              <button
                onClick={() => setIsPanelOpen(false)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2"
              >
                Volver al Chat
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-12 custom-scrollbar">
              <ContractSidebar {...sidebarProps} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatPanels;