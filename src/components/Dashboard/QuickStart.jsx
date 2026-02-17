import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, UserPlus, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuickStart = ({ balance = 0, hasVacancies = false }) => {
    const navigate = useNavigate();

    // Pasos del Onboarding
    const steps = [
        {
            id: 1,
            label: "Activar Billetera",
            description: "Recarga saldo para operar.",
            isCompleted: balance > 0,
            icon: Wallet,
            action: () => navigate('/dashboard/finanzas/recargar'),
            btnText: "Recargar"
        },
        {
            id: 2,
            label: "Publicar Vacante",
            description: "Crea tu primera oferta.",
            isCompleted: hasVacancies,
            icon: UserPlus,
            action: () => navigate('/dashboard/publicar'),
            btnText: "Publicar"
        }
    ];

    // Si todo está completo, no mostramos el QuickStart (el usuario ya es experto)
    const allCompleted = steps.every(s => s.isCompleted);
    if (allCompleted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-zinc-900 to-black border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden group"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* Header Section */}
                <div className="space-y-2 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            Guía de Inicio
                        </span>
                    </div>
                    <h3 className="text-xl text-white font-bold tracking-tight">Comienza con Turnes</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Completa estos pasos esenciales para desbloquear todo el potencial de tu cuenta y empezar a contratar.
                    </p>
                </div>

                {/* Steps List */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`
                flex-1 flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                ${step.isCompleted
                                    ? 'bg-zinc-900/30 border-emerald-500/20 opacity-60'
                                    : 'bg-zinc-800/40 border-white/10 hover:border-purple-500/30 hover:bg-zinc-800/60'
                                }
              `}
                        >
                            <div className={`p-3 rounded-full ${step.isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-zinc-400'}`}>
                                <step.icon size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold ${step.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                    {step.label}
                                </h4>
                                {!step.isCompleted && (
                                    <button
                                        onClick={step.action}
                                        className="mt-1 text-[10px] font-bold text-purple-400 flex items-center gap-1 hover:gap-2 transition-all"
                                    >
                                        {step.btnText} <ArrowRight size={12} />
                                    </button>
                                )}
                            </div>

                            <div className="text-zinc-600">
                                {step.isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
