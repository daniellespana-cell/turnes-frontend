import React from 'react';
import { MapPin, Clock, Ticket } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import { useNavigate } from 'react-router-dom';

/**
 * TodayMission — Widget de alta prioridad para el Dashboard.
 * Responsabilidad: Mostrar el turno activo o la misión principal del día con acciones rápidas.
 */
const TodayMission = ({ priorityAction, loading }) => {
    const navigate = useNavigate();

    if (loading) return <Skeleton className="w-full h-[200px]" />;
    if (priorityAction?.type !== 'SHIFT_TODAY') return null;

    const { data, title, subtitle, actionLabel } = priorityAction;

    return (
        <section className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 pl-1">
                Tu Misión de Hoy
            </h2>
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-1">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/40 rounded-[2.3rem] p-6 md:p-8 space-y-6 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                                <Clock size={10} /> {subtitle.split('•')[0]}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                {title}
                            </h3>
                            <p className="text-zinc-500 font-medium flex items-center gap-1.5">
                                <MapPin size={14} /> {data.address}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ganancia</span>
                            <span className="block text-xl font-bold text-emerald-400">
                                ${data.earnings?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/chats')}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            type="button"
                            aria-label="Acción">
                            <Ticket size={16} /> {actionLabel}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/chats')}
                            className="px-6 py-3.5 rounded-2xl border border-zinc-800 hover:bg-white/5 text-zinc-300 font-bold uppercase text-[10px] tracking-widest transition-colors"
                            type="button"
                            aria-label="Acción">
                            Contactar
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TodayMission;
