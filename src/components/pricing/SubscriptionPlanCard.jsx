import React from 'react';
import { m as motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { Shield, Zap, Crown } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';

const planStyles = {
    basic: {
        gradient: "from-zinc-800 to-zinc-900",
        border: "border-zinc-700",
        icon: Shield,
        iconColor: "text-emerald-400",
        glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]",
        buttonGradient: "from-zinc-600 to-zinc-500 hover:from-zinc-500 hover:to-zinc-400"
    },
    micro: {
        gradient: "from-indigo-900/40 to-indigo-950/40",
        border: "border-indigo-500/30",
        icon: Zap,
        iconColor: "text-indigo-400",
        glow: "group-hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.2)]",
        buttonGradient: "from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400"
    },
    pro: {
        gradient: "from-purple-900/40 via-fuchsia-900/20 to-pink-900/40",
        border: "border-purple-500/30",
        icon: Crown,
        iconColor: "text-purple-400",
        glow: "group-hover:shadow-[0_0_50px_-5px_rgba(168,85,247,0.3)]",
        buttonGradient: "from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-500 hover:to-pink-400"
    }
};

const SubscriptionPlanCard = ({ plan, isCurrent, isDowngrade, handleUpgrade, cardVariants }) => {
    const styles = planStyles[plan.slug] || planStyles.basic;
    const Icon = styles.icon;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.01 }}
            className={`group relative flex flex-col h-full rounded-3xl border ${styles.border} bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 ${styles.glow} overflow-hidden`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none z-0" />
            <div className="relative p-5 md:p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-transparent ${styles.iconColor}`}>
                        <Icon size={20} />
                    </div>
                    {plan.is_popular && (
                        <span className="py-0.5 px-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                            Más Popular
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">{plan.nombre}</h3>
                <p className="text-zinc-400 text-[11px] leading-relaxed mb-4 h-8 line-clamp-2">
                    {plan.description}
                </p>

                <div className="mb-6 p-3 rounded-xl bg-black/20 border border-transparent">
                    <div className="flex items-baseline mb-3">
                        <span className="text-3xl font-bold text-white tracking-tight">
                            {plan.costo_mensual === 0 ? "Gratis" : formatCurrency(plan.costo_mensual).replace(',00', '')}
                        </span>
                        <span className="text-zinc-500 ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                            {plan.costo_mensual === 0 ? " SIEMPRE" : "/ mes"}
                        </span>
                    </div>
                    
                    {plan.comision_turnos_pct !== undefined && (
                        <div className={`text-[11px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5 ${
                            Number(plan.comision_turnos_pct) === 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : Number(plan.comision_turnos_pct) <= 4
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                            <span className="relative flex h-2 w-2">
                              {Number(plan.comision_turnos_pct) === 0 && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                  Number(plan.comision_turnos_pct) === 0 ? 'bg-emerald-500' : Number(plan.comision_turnos_pct) <= 4 ? 'bg-indigo-500' : 'bg-zinc-500'
                              }`}></span>
                            </span>
                            Comisión por contratación: {Number(plan.comision_turnos_pct)}%
                        </div>
                    )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-grow">
                    {(plan.features || []).map((feat, i) => (
                        <li key={i} className="text-[13px] text-zinc-300 flex items-start gap-2.5 group/item">
                            <div className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-colors duration-300">
                                <Check size={10} strokeWidth={3} />
                            </div>
                            <span className="group-hover:text-white transition-colors duration-300">{feat}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => !isCurrent && handleUpgrade(plan.slug)}
                    disabled={isCurrent}
                    className={`relative w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden group/btn shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                        isCurrent
                            ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700 shadow-none'
                            : isDowngrade
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                : `bg-gradient-to-r ${styles.buttonGradient} text-white border border-transparent`
                    }`}
                    type="button"
                    aria-label="Acción">
                    <span className="relative z-10 drop-shadow-md">
                        {isCurrent ? "Plan Actual" : isDowngrade ? "Bajar a este plan" : "Seleccionar"}
                    </span>
                </button>
            </div>
        </motion.div>
    );
};

export default SubscriptionPlanCard;
