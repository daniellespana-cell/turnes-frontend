import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Star 
} from 'lucide-react';
import ChatMatchMockup from './mockups/ChatMatchMockup';

/**
 * StepMatchChat (Paso 2)
 * Tarjeta blanca modular que orquesta la explicación y el mockup de chat con Sara y botón de Match
 */
const StepMatchChat = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900">
      {/* Contenido explicativo */}
      <div className="lg:col-span-6 space-y-4">
        {/* Badges de Paso y Estrellas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap size={13} />
            Paso 2 · Selección y Match
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
            <div className="flex text-amber-400">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold">4.9/5</span>
            <span className="text-zinc-500 font-normal">reputación Sara</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight leading-tight">
          Revisa perfiles, chatea y haz Match
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed">
          Recibe postulaciones de talentos cercanos. Valida su identidad con foto y cédula, revisa las calificaciones otorgadas por otros negocios y aclara dudas directamente en el chat. Cuando encuentres al indicado, pulsa <strong>Hacer Match</strong>.
        </p>

        <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-zinc-700">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={17} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Seguridad y confianza:</strong> Perfiles verificados con antecedentes y cédula visible.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Zap size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Botón Hacer Match:</strong> Cierra el acuerdo formal de inmediato con un solo toque.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Chat ágil y directo:</strong> Coordina horarios, uniforme y llegada en segundos.
            </span>
          </div>
        </div>

        {/* Micro-tarjetas con iconos ligeros */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <ShieldCheck size={15} className="text-blue-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">Identidad</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">100% Cédula</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Star size={15} className="text-amber-500 fill-amber-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">4.9 ★</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">24 turnos previos</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Zap size={15} className="text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">Match 1-Clic</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Inmediato</span>
          </div>
        </div>
      </div>

      {/* Mockup Móvil Modular */}
      <div className="lg:col-span-6 flex justify-center items-center py-2">
        <ChatMatchMockup />
      </div>
    </div>
  );
};

export default StepMatchChat;
