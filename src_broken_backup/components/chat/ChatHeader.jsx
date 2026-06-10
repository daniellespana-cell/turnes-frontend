import { useNavigate } from 'react-router-dom';
import { AssetResolver } from '../../utils/assetHelper';

export const ChatHeader = ({ candidate, onToggleSidebar, onVideoInvite, isPaid, isClosed, userRole, videoStats }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 md:h-20 bg-zinc-900/30 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">

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
          {candidate?.avatar ? (
            <img
              src={AssetResolver.getAvatar(candidate.avatar)}
              className={`w-10 h-10 rounded-full border border-white/5 bg-zinc-900 object-cover ${isClosed ? 'grayscale opacity-50' : 'grayscale-[0.5]'}`}
              alt={candidate?.name}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase bg-gradient-to-br from-zinc-800 to-black border border-white/10 ${candidate?.avatar ? 'hidden' : 'flex'}`}
            style={{ display: candidate?.avatar ? 'none' : 'flex' }}
          >
            {candidate?.name?.charAt(0) || 'T'}
          </div>

          {!isClosed && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
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

        {/* Cámara: Solo Empresa puede iniciarla, y solo si NO está cerrado */}
        {!isClosed && userRole === 'empresa' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onVideoInvite}
              className={`p-2 transition-all group active:scale-90 flex items-center justify-center ${(!isPaid || videoStats?.remaining === 0)
                ? 'text-red-500 opacity-40 cursor-not-allowed'
                : 'text-zinc-600 hover:text-emerald-500'
                }`}
              title={!isPaid ? 'Requiere pago de conexión' : videoStats?.remaining === 0 ? 'Sin pases disponibles' : 'Iniciar Cita por Video'}
              disabled={!isPaid || videoStats?.remaining === 0}
            >
              <Video size={16} className={`transition-transform ${videoStats?.remaining > 0 ? 'group-hover:scale-110' : ''}`} />
            </button>
            {videoStats && (
              <div className="flex flex-col items-center justify-center">
                <span className={`text-[10px] font-black tracking-tighter ${videoStats.remaining === 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                  {videoStats.remaining}/{videoStats.total}
                </span>
                <span className="text-[6px] text-zinc-500 font-bold uppercase tracking-widest -mt-[2px]">
                  Pases
                </span>
              </div>
            )}
          </div>
        ) : isClosed ? (
          <div className="p-2 text-zinc-800" title="Canal Protegido">
            <Lock size={14} />
          </div>
        ) : null}

        <div className="w-[1px] h-4 bg-white/10 mx-1 md:mx-2" />

        {/* Toggle Panel con estilo de HAMBURGUESA nativo (Solo Empresas) */}
        {userRole !== 'trabajador' && (
          <button
            onClick={onToggleSidebar}
            className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all ${isClosed
              ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
              : 'bg-transparent hover:bg-zinc-800'
              }`}
            title="Abrir Detalles"
          >
            <Menu size={20} className={isClosed ? "text-blue-400" : "text-zinc-400"} />
          </button>
        )}
      </div>

    </header>
  );
};

export default ChatHeader;