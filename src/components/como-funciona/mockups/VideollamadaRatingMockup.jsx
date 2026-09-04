import React from 'react';
import { 
  CheckCircle2, 
  Mic, 
  VideoOff, 
  PhoneOff, 
  Star, 
  Award 
} from 'lucide-react';
import SmartphoneFrame from '../SmartphoneFrame';

/**
 * VideollamadaRatingMockup
 * Mockup de videollamada HD express y calificación 5 estrellas
 */
const VideollamadaRatingMockup = () => {
  return (
    <SmartphoneFrame>
      {/* Parte Superior: Videollamada activa */}
      <div className="relative bg-zinc-950 text-white overflow-hidden flex flex-col justify-between h-[230px]">
        {/* Header de la llamada */}
        <div className="p-2.5 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-bold text-white tracking-wide">EN VIVO · 02:15</span>
          </div>
          <span className="text-[8px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-purple-200 border border-white/20">
            HD 1080p
          </span>
        </div>

        {/* Feed de video de Sara */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <img 
            src="/sara-avatar.webp" 
            alt="Videollamada Sara" 
            className="w-full h-full object-cover object-center opacity-85 scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
          <div className="absolute bottom-11 left-2.5 text-left">
            <span className="text-[11px] font-bold text-white block">Sara (Candidata)</span>
            <span className="text-[8px] text-emerald-400 font-medium">Micrófono & video conectados</span>
          </div>
        </div>

        {/* Picture-in-Picture */}
        <div className="absolute top-8 right-2.5 w-12 h-16 rounded-lg overflow-hidden border border-white/40 shadow bg-zinc-800 z-10 flex flex-col items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">
            T
          </div>
          <span className="text-[7px] text-zinc-300 mt-0.5 font-semibold">Tú</span>
        </div>

        {/* Controles de llamada */}
        <div className="relative z-10 pb-2.5 flex items-center justify-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Mic size={11} />
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <VideoOff size={11} />
          </div>
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white shadow">
            <PhoneOff size={11} />
          </div>
        </div>
      </div>

      {/* Parte Inferior: Calificación y Pago Post-Turno */}
      <div className="p-3 bg-white text-left flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={9} className="text-emerald-600" />
              Turno Completado
            </span>
            <span className="text-[9px] text-zinc-400 font-medium">Hoy · 12:35 AM</span>
          </div>

          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-100 border border-zinc-300 shrink-0">
              <img src="/sara-avatar.webp" alt="Sara" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-zinc-950 block leading-tight">Califica a Sara</span>
              <span className="text-[8px] text-zinc-500">Mesera de Fin de Semana</span>
            </div>
          </div>

          {/* Estrellas 5.0 */}
          <div className="flex items-center gap-1 my-1 p-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] font-black text-amber-700 ml-1">5.0</span>
            <span className="text-[9px] text-amber-800 font-semibold ml-auto">¡Excelente!</span>
          </div>

          <div className="p-1.5 rounded-md bg-zinc-50 border border-zinc-200/80 text-[9px] text-zinc-700 italic leading-snug">
            "Sara llegó 15 min antes, excelente trato a comensales. Recomendada 100%."
          </div>
        </div>

        {/* Confirmación de Liquidación Directa */}
        <div className="mt-1.5 pt-1.5 border-t border-zinc-100">
          <div className="flex items-center justify-between text-[9px] font-bold text-emerald-700 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
            <span className="flex items-center gap-1">
              <Award size={11} className="text-emerald-600" />
              $70.000 COP Pago Directo
            </span>
            <span className="text-[8px] text-emerald-600 font-semibold">Liquidado ✓</span>
          </div>
        </div>
      </div>
    </SmartphoneFrame>
  );
};

export default VideollamadaRatingMockup;
