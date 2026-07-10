import React from 'react';
import { Clock, Trash2, Zap } from 'lucide-react';
import { m as motion } from 'framer-motion';

import { ShieldCheck, Search, Star, TrendingUp } from 'lucide-react';

/** Mapeo compacto: color de dominio → clases Tailwind */
export const COLOR_DOT = {
    emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    purple:  'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    amber:   'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    blue:    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    yellow:  'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]',
    zinc:    'bg-zinc-500',
    red:     'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
};

/** Beneficios a mostrar en la card Elite */
const ELITE_BENEFITS = [
    { icon: Search,     text: 'Primero en búsquedas de talento' },
    { icon: ShieldCheck,text: 'Badge "Elite Verificado" visible' },
    { icon: Star,       text: 'Acceso a candidatos top calificados' },
    { icon: TrendingUp, text: 'Mayor tasa de postulaciones recibidas' },
];

/**
 * Card especial para VERIFICATION_APPROVED — muestra beneficios Elite.
 */
const EliteVerifiedCard = ({ note, onClick, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, scale: 0.95, overflow: 'hidden' }}
        transition={{ duration: 0.25 }}
        className="w-full py-5 px-6 group"
    >
        {/* Header con glow */}
        <div
            className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-cyan-500/5 p-5 cursor-pointer hover:border-blue-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.07)]"
            onClick={() => onClick(note)}
            role="button"
            tabIndex={0}
        >
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Título */}
            <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)] shrink-0">
                        <ShieldCheck size={16} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white leading-tight">{note.title}</h3>
                        <time className="text-[10px] text-blue-400/70 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={9} className="opacity-70" /> {note.timeLabel}
                        </time>
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        type="button"
                        aria-label="Acción">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Beneficios en grid */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
                {ELITE_BENEFITS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                        <Icon size={12} className="text-blue-400 shrink-0" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-blue-200 leading-tight">{text}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1.5 mt-3 relative z-10">
                <Zap size={11} className="text-blue-400" />
                <span className="text-[11px] text-blue-400 font-bold">Ver mi perfil Elite →</span>
            </div>
        </div>
    </motion.div>
);

/**
 * @param {{ note: object, isLast: boolean, onClick: Function, onDelete: Function }} props
 * `note.timeLabel` viene pre-formateado desde el Context normalizador.
 */
const NotificationItem = ({ note, isLast, onClick, onDelete }) => {
    // Render especial para verificación Elite
    if (note.tipo === 'VERIFICATION_APPROVED') {
        return <EliteVerifiedCard note={note} onClick={onClick} onDelete={onDelete} />;
    }

    const unread = !note.leida;
    const dot = COLOR_DOT[note.color] ?? COLOR_DOT.zinc;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0, scale: 0.95, padding: 0, margin: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
            className={`w-full text-left py-5 px-6 flex gap-4 items-start transition-all duration-300 group
                ${isLast ? '' : 'border-b border-white/[0.04]'}
                ${unread ? 'bg-purple-900/10 hover:bg-purple-900/20' : 'hover:bg-white/5'}`}
        >
            <div className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div
                className="flex-1 min-w-0 cursor-pointer focus:outline-none"
                onClick={() => onClick(note)}
                role="button"
                tabIndex={0}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1.5">
                    <h3 className={`text-sm font-bold leading-snug ${unread ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        <span className="mr-1.5">{note.icon}</span>{note.title}
                    </h3>
                    <time className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono bg-black/40 px-2 py-1 rounded-lg border border-transparent shrink-0 whitespace-nowrap">
                        <Clock size={10} className="opacity-60" />
                        {note.timeLabel}
                    </time>
                </div>
                <p className={`text-xs leading-relaxed transition-colors ${unread ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    {note.body}
                </p>
            </div>
            <div className="-mt-1 -mr-2 flex flex-col items-end gap-2 shrink-0">
                {unread && (
                    <span className="shrink-0 mt-3 mr-2 w-2 h-2 rounded-full bg-purple-500 border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-60 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Eliminar notificación"
                        type="button">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default NotificationItem;

