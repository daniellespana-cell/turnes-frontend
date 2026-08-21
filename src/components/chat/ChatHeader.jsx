import React, { useSyncExternalStore } from 'react';
import { ShieldCheck, MoreHorizontal, LayoutDashboard, Video, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AssetResolver } from '../../utils/assetHelper';
import { chatState } from '../../services/chat/chatState';
import { useAuth } from '../../context/AuthContext';

export const ChatHeader = ({ candidate, onToggleSidebar, onVideoInvite, isClosed, isPaid, userRole, hasValidatedVideo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(chatState.subscribe, chatState.getSnapshot);

  // 🛡️ Resolución inequívoca del interlocutor según el rol autenticado
  const targetUserId = candidate?.otherUserId 
    || (user?.rol === 'empresa' ? (candidate?.candidateId || candidate?.postulante_id || candidate?.user_id) : (candidate?.companyId || candidate?.empresa_id))
    || candidate?.id;

  const isOnline = Boolean(candidate?.isOnline || (targetUserId && snapshot.onlineUsers?.[targetUserId]));

  const isEmployer = user?.rol === 'empresa' || userRole === 'empresa';
  const isVideoValidated = Boolean(
    hasValidatedVideo || 
    candidate?.protocol_state?.video_validated || 
    candidate?.videoHabilitado || 
    candidate?.step >= 2
  );

  return (
    <header className="h-20 border-b border-white/5 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* IDENTIDAD DEL CONTACTO + NAVEGACIÓN */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">

        {/* BOTÓN DE RETROCESO UNIVERSAL (Escritorio y Móvil) */}
        <button
          onClick={() => navigate('/dashboard/chats')}
          className="p-2 -ml-2 text-zinc-600 hover:text-white transition-all active:scale-90 group relative"
          title="Volver"
          type="button"
          aria-label="Acción">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="relative shrink-0 ml-1">
          <img
            src={AssetResolver.getAvatar(candidate?.avatar, candidate?.name || 'Usuario')}
            className={`w-10 h-10 rounded-full border border-white/10 bg-zinc-900 object-cover ${isClosed ? 'grayscale opacity-50' : 'grayscale-[0.5]'}`}
            alt="Avatar"
          />
          {!isClosed && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-in fade-in zoom-in duration-300" />
          )}
        </div>

        <div className="min-w-0 ml-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-black text-white uppercase tracking-tight truncate">
              {candidate?.name || "Cargando..."}
            </h3>
            {candidate?.isVerified && (
              <ShieldCheck size={12} className={isClosed ? "text-zinc-600" : "text-blue-400"} />
            )}
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isClosed ? 'text-zinc-600' : isOnline ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
            {!isClosed && isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />}
            {isClosed ? 'Turno Finalizado · Archivo' : isOnline ? 'En línea' : 'Desconectado'}
          </p>
        </div>
      </div>
      {/* ACCIONES MINIMALISTAS (Solo la empresa tiene acceso al disparador de video) */}
      <div className="flex items-center gap-1 md:gap-2">

        {/* 📹 Cámara: Regla 1 (Solo Empresa) y Regla 4 (Desactivada tras Validación) */}
        {isEmployer && (
          !isClosed && isPaid ? (
            isVideoValidated ? (
              <button
                disabled
                className="p-2 text-zinc-600 opacity-40 cursor-not-allowed"
                title="Validación visual completada"
                type="button"
                aria-label="Validación visual completada">
                <Video size={16} />
              </button>
            ) : (
              <button
                onClick={onVideoInvite}
                className="p-2 text-zinc-600 hover:text-emerald-500 transition-all group active:scale-90"
                title="Iniciar Cita por Video"
                type="button"
                aria-label="Acción">
                <Video size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            )
          ) : (
            <div className="p-2 text-zinc-800" title={isClosed ? "Canal Protegido" : "Requiere Pago de Comisión"}>
              <Lock size={14} className={!isClosed && !isPaid ? "text-amber-500/50" : ""} />
            </div>
          )
        )}

        {isEmployer && <div className="w-[1px] h-4 bg-white/10 mx-1 md:mx-2" />}

        {/* Toggle Panel con estilo discreto */}
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${isClosed
            ? 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10'
            : 'bg-zinc-900/50 hover:bg-zinc-800 border-white/5'
            }`}
          type="button"
          aria-label="Acción">
          <LayoutDashboard size={14} className={isClosed ? "text-blue-400" : "text-zinc-400"} />
          <span className={`hidden lg:block text-[9px] font-black uppercase tracking-widest ${isClosed ? "text-blue-400" : "text-zinc-400"}`}>
            {isClosed ? 'Resumen' : 'Detalles'}
          </span>
        </button>

        <button
          className="p-2 text-zinc-600 hover:text-white transition-all"
          type="button"
          aria-label="Acción">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;