import React from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { Wallet, UserPlus } from 'lucide-react';

export const QuickStart = ({ walletActive = false, vacancyPublished = false, isLoading = true }) => {
    const navigate = useNavigate();

    // 0. ESTADO INTELIGENTE: Si las dos promesas están cumplidas, ocultar banner (Reducir ruido)
    if (isLoading || (walletActive && vacancyPublished)) return null;

    // Pasos del Onboarding
    const steps = [
        {
            id: 1,
            label: "Activar Billetera",
            description: "Recarga saldo para operar.",
            isCompleted: walletActive,
            icon: Wallet,
            action: () => navigate('/dashboard/finanzas/recargar'),
            btnText: "Recargar"
        },
        {
            id: 2,
            label: "Publicar Vacante",
            description: "Crea tu primera oferta.",
            isCompleted: vacancyPublished,
            icon: UserPlus,
            action: () => navigate('/publicar'),
            btnText: "Publicar"
        }
    ];

    // Progreso
    const completedCount = steps.filter(s => s.isCompleted).length;
    const progressPercentage = (completedCount / steps.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050505] border border-transparent rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group shadow-lg"
        >
            {/* Background Decor (JobToday subtle pulse) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

            {/* ProgressBar Top */}
            <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, type: "spring" }}
                />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                {/* Header Section */}
                <div className="space-y-3 max-w-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest drop-shadow-sm">
                            Onboarding {progressPercentage}%
                        </span>
                    </div>
                    <h3 className="text-2xl text-white font-black tracking-tight drop-shadow-md">
                        {progressPercentage === 100 ? '¡Estás listo para contratar! 🚀' : 'Tu Camino al Éxito'}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {progressPercentage === 100
                            ? 'Tu cuenta está optimizada. Ahora solo relájate y explora los mejores talentos de la plataforma.'
                            : 'Completa estos pasos esenciales para desbloquear todo el potencial de tu cuenta y atraer al mejor talento.'}
                    </p>
                </div>

                {/* Steps List */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1 justify-end">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.15 + 0.2 }}
                            whileHover={!step.isCompleted ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!step.isCompleted ? { scale: 0.98 } : {}}
                            onClick={!step.isCompleted ? step.action : undefined}
                            className={`
                                flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                ${step.isCompleted
                                    ? 'bg-emerald-500/5 border-emerald-500/10 opacity-70'
                                    : 'bg-zinc-900/50 border-white/5  hover:bg-zinc-900 shadow-inner cursor-pointer hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)]'
                                }
                            `}
                        >
                            {!step.isCompleted && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity" />
                            )}

                            <div className={`p-3.5 rounded-2xl shrink-0 ${step.isCompleted ? 'bg-emerald-500/10 text-emerald-500 shadow-inner' : 'bg-black border border-transparent text-zinc-400 shadow-lg'}`}>
                                <step.icon size={20} strokeWidth={step.isCompleted ? 2.5 : 2} />
                            </div>

                            <div className="flex-1 min-w-0 z-10">
                                <h4 className={`text-[13px] font-black uppercase tracking-wide mb-1 ${step.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                    {step.label}
                                </h4>
                                {!step.isCompleted && (
                                    <div className="text-[10px] font-bold text-indigo-400 transition-all flex items-center gap-1 group-hover:gap-2">
                                        {step.btnText} <ArrowRight size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                                {step.isCompleted ? <CheckCircle2 size={20} className="text-emerald-500 drop-shadow-md" /> : <Circle size={20} className="text-zinc-700" />}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default QuickStart;
