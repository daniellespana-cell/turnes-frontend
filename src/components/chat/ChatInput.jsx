import React, { useState, useMemo } from 'react';
import { Send, ShieldCheck, ShieldAlert, Lock, Zap, X, Lightbulb, Info } from 'lucide-react';

// Hooks
import { useChatSecurity } from '../../hooks/chat/useChatSecurity';

export const ChatInput = ({ onSend, isPaid, isClosed, canWrite, userRole }) => {
  const [text, setText] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // 1. SECURITY HOOK
  const { validateSecurity } = useChatSecurity();

  const showClosedBanner = isClosed;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 2. VALIDATION VIA HOOK
    const check = validateSecurity(text);

    if (!check.valid) {
      setIsWarning(true);
      setTimeout(() => setIsWarning(false), 3000);
      return;
    }

    // 3. CLEANUP & SEND
    const cleanText = text.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ 0-9,.¿?¡!]/g, "");
    if (cleanText && cleanText.trim()) {
      onSend(cleanText);
      setText('');
    }
  };

  const suggestions = useMemo(() => isClosed
    ? ["Hagamos una validación visual rápida", "Confirma asistencia puntual", "¿Sabes cómo llegar?"]
    : ["Te pago en efectivo al finalizar", "¿Estás disponible hoy?", "Vi tu perfil y me interesó"],
    [isClosed]);

  // CASO: CICLO SELLADO (PASO 5)
  if (showClosedBanner) {
    return (
      <div className="p-4 md:px-8 pb-8 bg-[#050505] border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
            <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-white font-bold uppercase tracking-widest mb-1">Ciclo de servicio finalizado</p>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Para tu seguridad y evitar malos ratos, el chat se ha cerrado. ¡Gracias por construir la Red de Confianza!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // INTERFAZ ACTIVA (PASOS 1, 2, 3 y 4)
  return (
    <div className="px-4 py-3 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5 relative">

      {/* SUGERENCIAS */}
      <div className={`max-w-4xl mx-auto flex items-center gap-3 transition-all duration-700 overflow-hidden ${(!text && showTips) ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
        <div className="flex flex-wrap gap-2 flex-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onSend(s); setText(''); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/20 border border-indigo-500/20 rounded-xl hover:border-emerald-500/50 hover:bg-gradient-to-r hover:from-indigo-600/10 hover:to-emerald-500/10 transition-all duration-500 group"
            >
              <Zap size={8} className="text-indigo-500/50 group-hover:text-emerald-400 transition-colors" fill="currentColor" />
              <span className="text-[8px] font-black text-zinc-600 group-hover:text-zinc-200 uppercase tracking-[0.1em]">
                {s}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowTips(false)} className="p-1 text-zinc-900 hover:text-zinc-700 transition-colors">
          <X size={10} />
        </button>
      </div>

      {isWarning && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black uppercase px-6 py-2 rounded-full flex items-center gap-2 shadow-2xl z-50 tracking-widest">
          <ShieldAlert size={12} /> Protocolo Anti-Fuga
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className={`p-2 transition-all duration-500 ${showTips ? 'text-indigo-500/60' : 'text-zinc-900 hover:text-zinc-700'}`}
        >
          <Lightbulb size={14} strokeWidth={showTips ? 2.5 : 1.5} />
        </button>

        <div className="flex-1 flex items-center gap-4 bg-zinc-900/10 border border-white/5 rounded-[1.5rem] p-1.5 pl-4 focus-within:border-white/10 transition-all">
          <div className={`transition-colors duration-500 ${isPaid ? 'text-emerald-500/70' : 'text-zinc-800'}`}>
            {isPaid ? <ShieldCheck size={16} /> : <Lock size={16} />}
          </div>

          <input
            disabled={!canWrite}
            onChange={(e) => setText(e.target.value)}
            value={text} // ✅ Controlled Input
            placeholder={
              canWrite
                ? "Escribe un mensaje seguro..."
                : (userRole === 'empresa' ? "Realiza el pago para desbloquear el chat..." : "Esperando confirmación de la empresa...")
            }
            className={`flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600 font-medium py-2 ${!canWrite && 'cursor-not-allowed text-zinc-500'}`}
          />

          <button
            type="submit"
            disabled={!text.trim() || isWarning || !canWrite}
            className={`
              p-2.5 rounded-xl transition-all duration-500 shadow-lg
              ${text.trim() && !isWarning && !isClosed
                ? 'bg-gradient-to-br from-indigo-600 to-emerald-500 text-white opacity-100 scale-100'
                : 'bg-zinc-900 text-zinc-800 opacity-20 scale-95'
              }
            `}
          >
            <Send size={14} strokeWidth={3} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;