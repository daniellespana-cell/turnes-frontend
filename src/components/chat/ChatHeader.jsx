import React from 'react';
import { ShieldCheck, MoreHorizontal, LayoutDashboard, Video, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatHeader = ({ candidate, onToggleSidebar, onVideoInvite, isClosed }) => {
  const navigate = useNavigate();

  return (
    <header className="h-20 border-b border-white/5 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">

      {/* IDENTIDAD DEL CONTACTO + NAVEGACIÓN */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">

        {/* BOTÓN DE RETROCESO UNIVERSAL (Escritorio y Móvil) */}
        <button
          onClick={() => navigate('/dashboard/chats')}
          className="p-2 -ml-2 text-zinc-600 hover:text-white transition-all active:scale-90 group relative"
          title="Volver"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="relative shrink-0 ml-1">
          <img
            src={candidate?.avatar}
            className={`w-10 h-10 rounded-full border border-white/10 bg-zinc-900 object-cover ${isClosed ? 'grayscale opacity-50' : 'grayscale-[0.5]'}`}
            alt="Avatar"
          />
          {!isClosed && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
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
          <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isClosed ? 'text-zinc-600' : 'text-emerald-500/80'}`}>
            {!isClosed && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
            {isClosed ? 'Turno Finalizado · Archivo' : 'En línea · Radicado Activo'}
          </p>
        </div>
      </div>

      {/* ACCIONES MINIMALISTAS (SIN QUITAR NADA) */}
      <div className="flex items-center gap-1 md:gap-2">

        {/* Cámara: Solo se muestra si el ciclo NO está cerrado */}
        {!isClosed ? (
          <button
            onClick={onVideoInvite}
            className="p-2 text-zinc-600 hover:text-emerald-500 transition-all group active:scale-90"
            title="Iniciar Cita por Video"
          >
            <Video size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <div className="p-2 text-zinc-800" title="Canal Protegido">
            <Lock size={14} />
          </div>
        )}

        <div className="w-[1px] h-4 bg-white/10 mx-1 md:mx-2" />

        {/* Toggle Panel con estilo discreto */}
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${isClosed
            ? 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10'
            : 'bg-zinc-900/50 hover:bg-zinc-800 border-white/5'
            }`}
        >
          <LayoutDashboard size={14} className={isClosed ? "text-blue-400" : "text-zinc-400"} />
          <span className={`hidden lg:block text-[9px] font-black uppercase tracking-widest ${isClosed ? "text-blue-400" : "text-zinc-400"}`}>
            {isClosed ? 'Resumen' : 'Detalles'}
          </span>
        </button>

        <button className="p-2 text-zinc-600 hover:text-white transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

    </header>
  );
};

export default ChatHeader;