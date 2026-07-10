import React from 'react';
import ContractSidebar from './ContractSidebar';

import { createPortal } from 'react-dom';

const ChatPanels = ({
  chat,
  candidato,
  fromVacante,
  isClosed,
  stats,
  onPay,
  onExecute,
  onFinalize,
  onVideoInvite,
  isPanelOpen,
  setIsPanelOpen
}) => {
  // 1. DESESTRUCTURACIÓN SEGURA
  const {
    finanzas = {},
    permisos = {}
  } = chat || {};

  // 2. SINCRONIZACIÓN DE PERMISOS (Fuente Única de Verdad = Backend ContractSOT)
  const effectivePermisos = {
    ...permisos, // useChatPermissions ya tiene la verdad blindada
    isPaid: permisos?.isPaid,
    isClosed: isClosed || permisos?.isClosed
  };

  const sidebarProps = {
    candidate: candidato,
    fromVacante,
    finanzas: { ...finanzas, isPaying: chat?.isPaying },
    permisos: effectivePermisos,
    activeStep: chat?.activeStep, // 🔥 SOT: El motor de pasos
    onPay: onPay,
    onExecute: onExecute || chat?.ejecutarAcuerdo, // Paso 3
    onFinalize: onFinalize,                         // Paso 4
    onVideoInvite: onVideoInvite || chat?.invitarAVideo,
    onClose: () => setIsPanelOpen(false),
    isFinalizing: chat?.isFinalizing,
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

          <div className="absolute top-0 bottom-0 right-0 w-[85vw] max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[110] flex flex-col animate-in slide-in-from-right duration-300 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="py-4 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-xl shrink-0">
              <span className="text-white font-bold tracking-wider text-sm">Resumen Contrato</span>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-transparent rounded-full text-white hover:bg-white/10 transition-colors"
                title="Cerrar Panel"
                type="button">
                ✕
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