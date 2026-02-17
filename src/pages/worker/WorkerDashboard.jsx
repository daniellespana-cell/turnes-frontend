import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Clock, DollarSign, Star,
    ChevronRight, AlertCircle, Ticket,
    TrendingUp, Award
} from 'lucide-react';
import { useWorkerDashboard } from '../../hooks/useWorkerDashboard';
import VacancyCard from '../../components/features/VacancyCard'; // IMPORTED
import { typography } from '../../styles/typography';

const WorkerDashboard = () => {
    const {
        user,
        loading,
        showOnboarding,
        priorityAction,
        gamification,
        profileProgress
    } = useWorkerDashboard();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-t-emerald-500 border-white/5 rounded-full animate-spin" />
                <span className="font-bold text-[10px] tracking-widest text-zinc-500 uppercase">
                    Cargando Tu Espacio
                </span>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto md:max-w-5xl md:px-6 pb-24 pt-20 px-4 min-h-screen font-manrope space-y-8 animate-fade-in">

            {/* HEADER: Saludo Minimalista */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
                        Bienvenido de nuevo
                    </p>
                    <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                        Hola, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{user?.name?.split(' ')[0] || 'Talento'}</span>
                    </h1>
                </div>

                {/* Widget de Ganancias (Gamificación) */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 flex flex-col items-end backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Meta Semanal</span>
                        <TrendingUp size={12} className="text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-white font-bold text-lg leading-none">${(gamification?.current || 0).toLocaleString()}</span>
                        <span className="text-zinc-600 text-[10px] font-medium">/ ${(gamification?.goal || 0).toLocaleString()}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-24 h-1 bg-zinc-800 rounded-full mt-2 relative overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${gamification?.percentage}%` }}
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* 1. SMART ONBOARDING (Solo si perfil < 80%) */}
            {showOnboarding && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-6"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award size={80} className="text-indigo-400" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Perfil Incompleto ({profileProgress}%)</span>
                        </div>

                        <div className="max-w-xs">
                            <h3 className="text-xl font-bold text-white leading-tight mb-2">
                                Completa tu perfil para ver mejores ofertas
                            </h3>
                            <p className="text-indigo-200/70 text-sm leading-relaxed">
                                Las empresas prefieren perfiles con foto y habilidades verificadas.
                            </p>
                        </div>

                        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                            Completar Ahora <ChevronRight size={14} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* 2. PRIORITY BLOCK (Dinámico) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className={typography.sectionTitle}>
                        {priorityAction?.type === 'SHIFT_TODAY' ? 'Tu Misión de Hoy' : 'Recomendado para ti'}
                    </h2>
                    {priorityAction?.type === 'RECOMMENDATIONS' && (
                        <button className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300">
                            Ver Todo
                        </button>
                    )}
                </div>

                {priorityAction?.type === 'SHIFT_TODAY' ? (
                    // CARD GIGANTE DE TURNO ACTIVO
                    <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-1">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative bg-black/40 rounded-[2.3rem] p-6 md:p-8 space-y-6 backdrop-blur-sm">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                                        <Clock size={10} /> {priorityAction.subtitle.split('•')[0]}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                        {priorityAction.title}
                                    </h3>
                                    <p className="text-zinc-500 font-medium flex items-center gap-1.5">
                                        <MapPin size={14} /> {priorityAction.data.address}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ganancia</span>
                                    <span className="block text-xl font-bold text-emerald-400">
                                        ${priorityAction.data.earnings.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-3">
                                <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <Ticket size={16} />
                                    {priorityAction.actionLabel}
                                </button>
                                <button className="px-6 py-3.5 rounded-2xl border border-white/10 hover:bg-white/5 text-zinc-300 font-bold uppercase text-[10px] tracking-widest transition-colors">
                                    Contactar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // CARDS DE RECOMENDACIÓN
                    <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-3 md:overflow-visible custom-scrollbar snap-x px-1">
                        {priorityAction?.data.map((vacancy) => (
                            <div key={vacancy.id} className="snap-center shrink-0 w-[85%] md:w-auto">
                                <VacancyCard vacancy={vacancy} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* FOOTER */}
            <div className="text-center py-8 opacity-20">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">
                    Turnes Talent v2.0
                </p>
            </div>
        </div>
    );
};

export default WorkerDashboard;
