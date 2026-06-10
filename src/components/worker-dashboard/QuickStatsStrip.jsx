import React from 'react';
import { motion } from 'framer-motion';

import { Briefcase, Star, Send, CalendarDays } from 'lucide-react';

/**
 * QuickStatsStrip — Fila horizontal scrollable de micro-KPIs
 * con animación stagger de entrada.
 */
const STAT_CONFIG = [
    { key: 'totalShifts', label: 'Turnos', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', format: v => v ?? 0 },
    { key: 'avgRating', label: 'Rating', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', format: v => v ?? '—' },
    { key: 'activeApplications', label: 'Activas', icon: Send, color: 'text-blue-400', bg: 'bg-blue-500/10', format: v => v ?? 0 },
    { key: 'daysSinceJoin', label: 'Días', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/10', format: v => v ?? 1 },
];

const QuickStatsStrip = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar snap-x">
            {STAT_CONFIG.map((stat, i) => {
                const Icon = stat.icon;
                const value = stat.format(stats[stat.key]);

                return (
                    <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                        className="snap-center shrink-0 flex-1 min-w-[100px] bg-zinc-900/40 rounded-2xl ring-1 ring-white/5 p-4 space-y-2 hover:ring-white/10 transition-all duration-300"
                    >
                        <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <Icon size={16} className={stat.color} />
                        </div>
                        <p className="text-lg font-black text-white tabular-nums leading-none">
                            {value}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {stat.label}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default QuickStatsStrip;
