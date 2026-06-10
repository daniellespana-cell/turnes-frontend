import React from 'react';

/**
 * StatCard - Átomo de visualización de métricas.
 * Optimizado para evitar re-renders.
 */
const StatCard = React.memo(({ label, value, icon }) => (
    <div className="glass-card p-4 md:p-5 flex flex-col items-center justify-center gap-1 hover:border-emerald-500/30 transition-all duration-500 group cursor-default">
        <div className="text-zinc-500 mb-1 group-hover:text-emerald-400 transition-all duration-500 transform group-hover:scale-110">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-lg md:text-xl font-black text-white tracking-tighter tabular-nums">{value}</span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-black text-center">{label}</span>
    </div>
));

StatCard.displayName = 'StatCard';
export default StatCard;
