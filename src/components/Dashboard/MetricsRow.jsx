import React from 'react';
import { Star, Target, Zap } from 'lucide-react';

const MetricsRow = ({ fillRate, averageRating, percentile }) => {
  return (
    <section className="grid grid-cols-3 gap-2 md:gap-4 px-1">
      {[
        { label: 'Match Rate', val: `${fillRate}%`, icon: Target, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
        { label: 'Reputación', val: averageRating || 'Nuevo', icon: Star, color: 'text-amber-400', bg: 'from-amber-500/10' },
        { label: 'Ecosistema', val: percentile, icon: Zap, color: 'text-purple-400', bg: 'from-purple-500/10' }
      ].map((m, i) => (
        <div key={i} className={`bg-gradient-to-br ${m.bg} to-transparent glass-card p-3 md:p-4 flex flex-col gap-1 border-white/5`}>
          <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
            <m.icon size={12} className={m.color} />
            <span className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">{m.label}</span>
          </div>
          <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tight">{m.val}</span>
        </div>
      ))}
    </section>
  );
};

export default MetricsRow;
