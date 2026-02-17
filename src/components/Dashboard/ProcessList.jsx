import React from 'react';
import { Zap, ArrowUpRight, AlertCircle } from 'lucide-react';

/**
 * ProcessList Nano-Scale: Botón con transición cromática garantizada.
 */
export const ProcessList = ({ activeProcess }) => {
  return (
    <section className="space-y-3">
      {/* Header Nano-Label */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[7px] font-bold text-zinc-700 uppercase tracking-[0.5em] antialiased">
          Procesos en curso
        </h2>
      </div>

      <div className="bg-zinc-900/10 border border-white/5 rounded-xl overflow-hidden transition-all duration-500">

        {/* Item de Decisión Crítica */}
        <div className="group flex flex-col md:flex-row items-center justify-between p-4 bg-black/20 hover:bg-white/[0.02] transition-all gap-4 border-b border-white/5 last:border-0 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/10 text-orange-500/80 shrink-0">
              <AlertCircle size={14} />
            </div>

            <div className="space-y-0.5">
              <h4 className="text-[10px] font-bold text-zinc-200 uppercase tracking-tight leading-none">
                {activeProcess?.title || 'Análisis de flujo...'}
              </h4>
              <p className="text-[9px] text-zinc-600 font-medium tracking-tight">
                {activeProcess?.meta || 'Sincronizando señales'}
              </p>
            </div>
          </div>

          {/* BOTÓN DARK GLASS */}
          <button className="w-full md:w-auto px-5 py-2 bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm hover:bg-zinc-800 hover:text-white hover:border-white/20 transition-all duration-200 active:scale-95 relative overflow-hidden group/btn">
            <span className="relative z-10 text-[8px]">Elegir Candidato</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] z-0" />
          </button>
        </div>

        {/* Item de Historial Rápido */}
        <div className="group flex items-center justify-between p-3.5 opacity-40 hover:opacity-100 transition-all cursor-pointer bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Zap size={10} className="text-zinc-700 group-hover:text-yellow-500/50 transition-colors" />
            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
              Ver procesos finalizados esta semana
            </span>
          </div>
          <ArrowUpRight size={12} className="text-zinc-800 group-hover:text-zinc-500 transition-all" />
        </div>
      </div>
    </section>
  );
};