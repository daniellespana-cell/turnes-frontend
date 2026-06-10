
/**
 * PerformanceCard Nano-Scale: Sutileza en métricas de reputación.
 */
export const PerformanceCard = ({ metrics }) => (
  <section className="p-6 bg-zinc-900/10 border border-transparent rounded-[2rem] space-y-6 transition-all duration-500 hover:border-emerald-500/10">
    <div className="space-y-4">
      {/* TÍTULO NANO-TEXT: Máxima finura arquitectónica */}
      <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.6em] px-1 antialiased">
        Métricas de Confianza
      </p>

      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          {/* Label de métrica ultra sutil */}
          <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-[0.2em] leading-none">
            Crecimiento
          </p>
          <h4 className="text-2xl font-black text-white tracking-tighter italic leading-none">
            {metrics?.growth}
          </h4>
        </div>
        
        {/* Icono en escala reducida */}
        <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
          <TrendingUp className="text-emerald-500/70" size={16} />
        </div>
      </div>
    </div>
    
    {/* Footer de métrica con tipografía aireada */}
    <div className="pt-4 border-t border-white/5 px-1">
      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed tracking-tight">
        Estás en el <span className="text-zinc-200 font-black italic">{metrics?.percentile}</span> de empresas mejor calificadas.
      </p>
    </div>
  </section>
);