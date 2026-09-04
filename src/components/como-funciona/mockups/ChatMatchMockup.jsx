import React from 'react';
import { 
  ChevronLeft, 
  Phone, 
  Video, 
  Star, 
  MoreHorizontal, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';
import SmartphoneFrame from '../SmartphoneFrame';

/**
 * ChatMatchMockup
 * Mockup de chat con Sara y botón de Hacer Match
 */
const ChatMatchMockup = () => {
  return (
    <SmartphoneFrame>
      {/* Header Chat Sara */}
      <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <ChevronLeft size={18} className="text-zinc-800 stroke-[2.5] -ml-1 cursor-pointer" />
          
          {/* Avatar Sara con foto oficial */}
          <div className="relative w-8 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 shadow-xs">
            <img 
              src="/sara-avatar.webp" 
              alt="Sara - Postulante Turnes" 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-zinc-950 leading-none">Sara</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <span className="text-[9px] font-semibold text-emerald-600 block leading-tight mt-0.5">
              En línea
            </span>
            <span className="text-[8px] text-zinc-400 block leading-tight">
              Responde rápido
            </span>
          </div>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-1 text-zinc-600">
          <button className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <Phone size={10} className="text-zinc-700" />
          </button>
          <button className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <Video size={10} className="text-zinc-700" />
          </button>
          <button className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <Star size={10} className="text-amber-500 fill-amber-500" />
          </button>
          <button className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
            <MoreHorizontal size={10} className="text-zinc-700" />
          </button>
        </div>
      </div>

      {/* Área de Chat */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-white text-left space-y-2">
        <div className="space-y-2">
          {/* Mensaje Empresa */}
          <div className="flex justify-end items-end gap-1">
            <div className="max-w-[84%] bg-[#1d4ed8] text-white p-2.5 rounded-xl rounded-br-xs shadow-xs">
              <p className="text-[11px] leading-relaxed font-normal">
                ¡Hola Sara! Tu perfil está genial. ¿Te puedes pasar hoy?
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[8px] text-blue-200">09:39</span>
                <span className="text-[8px] text-blue-200 font-bold">✓✓</span>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-blue-800 text-white text-[8px] font-bold flex items-center justify-center shrink-0 mb-0.5">
              T
            </div>
          </div>

          {/* Mensaje Sara */}
          <div className="flex justify-start items-end gap-1">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-200 shrink-0 mb-0.5 border border-zinc-300">
              <img 
                src="/sara-avatar.webp" 
                alt="Sara" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
            <div className="max-w-[82%] bg-[#f4f4f5] text-zinc-900 p-2.5 rounded-xl rounded-bl-xs shadow-xs">
              <p className="text-[11px] leading-relaxed font-medium">
                ¡Me puedo pasar hoy! Tengo uniforme listo.
              </p>
              <span className="text-[8px] text-zinc-400 text-right block mt-0.5">
                9:41
              </span>
            </div>
          </div>

          {/* Tarjeta de Match */}
          <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-blue-50 border border-emerald-300/80 shadow-xs text-center">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <Sparkles size={11} className="text-emerald-600" />
              <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-wide">
                Mesero · Cabecera (Hoy 6:30 PM)
              </span>
            </div>

            {/* Botón de Match */}
            <div className="w-full py-2 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
              <Zap size={12} className="fill-white" />
              <span>⚡ Hacer Match y Contratar</span>
            </div>

            <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-700">
              <CheckCircle2 size={10} className="text-emerald-600" />
              <span>¡Match Confirmado! Turno asignado a Sara</span>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="pt-1">
          <div className="bg-[#f4f4f5] rounded-full p-1 pl-2.5 flex items-center justify-between border border-zinc-200">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
                <Plus size={12} className="stroke-[2.5]" />
              </div>
              <span className="text-[11px] text-zinc-400">Chatear con Sara</span>
            </div>
            <button className="px-2.5 py-0.5 rounded-full text-blue-600 font-bold text-[11px]">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </SmartphoneFrame>
  );
};

export default ChatMatchMockup;
