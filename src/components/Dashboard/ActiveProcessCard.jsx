import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';

/**
 * ActiveProcessCard Nano-Scale: Sutileza en gestión de procesos críticos.
 */
export const ActiveProcessCard = ({ process }) => {
  if (!process) return null;

  return (
    <div className="bg-zinc-900/10 border border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:border-white/10 group">
      <div className="flex flex-col md:flex-row items-center justify-between p-5 md:p-6 gap-4">
        
        {/* Lado Izquierdo: Identificación Micro */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-orange-500/5 rounded-xl flex items-center justify-center border border-orange-500/10 text-orange-500/70 shrink-0 transition-transform group-hover:scale-105">
            <AlertCircle size={18} />
          </div>
          
          <div className="space-y-0.5">
            {/* Título de proceso en escala reducida */}
            <h4 className="text-xs font-black text-white uppercase tracking-tight leading-none italic">
              {process.title}
            </h4>
            {/* Metadata en minúsculas para mayor fluidez visual */}
            <p className="text-[10px] text-zinc-500 font-medium tracking-tight">
              {process.meta}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Acción Slim */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="w-full md:w-auto px-6 py-2.5 bg-zinc-100 text-black rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-95 antialiased">
            Elegir Candidato
          </button>
          
          <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 text-zinc-800 group-hover:text-zinc-500 group-hover:border-white/10 transition-all">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Footer Nano-Text: Máxima finura */}
      <div className="px-6 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.5em] antialiased">
          Protocolo de resolución pendiente
        </span>
        <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-orange-500/40" />
          <div className="w-1 h-1 rounded-full bg-orange-500/20" />
        </div>
      </div>
    </div>
  );
};