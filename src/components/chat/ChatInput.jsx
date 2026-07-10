import React from 'react';
import { Send, ShieldCheck, ShieldAlert, Lock, X, Lightbulb, Info } from 'lucide-react';
import ChatSuggestions from './ChatSuggestions';

import { useState, useRef } from 'react';

// Components & Hooks
import { useChatSecurity } from '../../hooks/chat/useChatSecurity';

export const ChatInput = ({ onSend, isPaid, isClosed, canWrite, userRole, isContracted, isRehire }) => {
  const [text, setText] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const inputRef = useRef(null);

  // 1. SECURITY HOOK
  const { validateSecurity } = useChatSecurity();

  const showClosedBanner = isClosed;

  const handleSubmit = (e) => {
    e?.preventDefault();

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
      // 🍎 iOS: blur para que el teclado se cierre y el viewport se restaure limpiamente
      inputRef.current?.blur();
    }
  };

  // CASO: CICLO SELLADO (PASO 5)
  if (showClosedBanner) {
    return (
      <div className="p-4 md:px-8 bg-[#050505] border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
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

  const isInputDisabled = !canWrite;

  const getPlaceholderText = () => {
    if (!canWrite) return userRole === 'empresa' ? "Paga para desbloquear" : "Esperando empresa";
    return "Mensaje";
  };

  // INTERFAZ ACTIVA (PASOS 1, 2, 3 y 4)
  return (
    <div className="shrink-0 px-3 py-2 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {/* SUGERENCIAS (SCROLL HORIZONTAL 2026 UX) */}
      <div className={`max-w-4xl mx-auto flex items-center gap-2 transition-all duration-700 overflow-hidden ${(!text && showTips && !isContracted) ? 'max-h-20 mb-3 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
        <div className="flex overflow-x-auto gap-2 flex-1 pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ChatSuggestions
            onSend={(s) => { onSend(s); setText(''); }}
            isContracted={isContracted}
            isRehire={isRehire}
            userRole={userRole}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowTips(false)}
          className="shrink-0 p-1.5 text-zinc-600 hover:text-white transition-colors bg-white/5 rounded-full hidden md:block"
          aria-label="Acción">
          <X size={12} />
        </button>
      </div>
      {isWarning && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black uppercase px-6 py-2 rounded-full flex items-center gap-2 z-50 tracking-widest">
          <ShieldAlert size={12} /> Protocolo Anti-Fuga
        </div>
      )}
      {/* 🍎 iOS FIX: Cambiado de <form> a <div> para ELIMINAR el "Form Accessory Bar" (flechas y botón Done) en Safari */}
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <button
          type="button"
          disabled={isInputDisabled}
          onClick={() => setShowTips(!showTips)}
          className={`p-1.5 transition-all duration-300 rounded-full ${showTips ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/40'} ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Sugerencias rápidas"
        >
          <Lightbulb size={14} className={showTips ? 'fill-yellow-500/20 text-yellow-500' : 'text-zinc-500'} strokeWidth={2} />
        </button>

        <div className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-transparent rounded-3xl py-1.5 px-4 focus-within:border-white/20 focus-within:bg-zinc-900 transition-all shadow-sm">
          <div className={`transition-colors duration-500 ${isPaid ? 'text-emerald-500/70' : 'text-zinc-600'}`}>
            {isPaid ? <ShieldCheck size={14} strokeWidth={2} /> : <Lock size={14} strokeWidth={2} />}
          </div>

          <input
            ref={inputRef}
            disabled={isInputDisabled}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(e);
            }}
            value={text}
            placeholder={getPlaceholderText()}
            enterKeyHint="send"
            autoComplete="off"
            className={`flex-1 bg-transparent text-[16px] text-zinc-100 outline-none placeholder:text-zinc-600 font-medium py-2 ${isInputDisabled ? 'cursor-not-allowed text-zinc-500' : ''}`}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isWarning || !canWrite}
          className={`
            p-2.5 rounded-full transition-all duration-300 shrink-0
            ${text.trim() && !isWarning && !isClosed
              ? 'bg-blue-600 text-white opacity-100 scale-100 shadow-lg shadow-blue-600/30'
              : 'bg-zinc-800 text-zinc-600 opacity-60 scale-95'
            }
          `}
          aria-label="Acción">
          <Send size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;