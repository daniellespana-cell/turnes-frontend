import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Info, Receipt, Zap } from 'lucide-react';

const PlanSummaryCard = ({ plan }) => {
    if (!plan) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="sticky top-24"
        >
            {/* CONTENT - Ultra Minimalist: No heavy backgrounds, just hierarchy */}
            <div className="space-y-8">

                {/* HEADER */}
                <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] text-${plan.accent}-400`}>
                        CONTRATO DIGITAL
                    </span>

                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {plan.title.replace('Plan ', '')}
                    </h2>

                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-light text-white tracking-tighter">
                            {plan.price}
                        </span>
                        <span className="text-zinc-500 text-sm">/ mes</span>
                    </div>

                    {/* ROI BADGE - Simple Text */}
                    <div className="flex items-center gap-2 pt-1">
                        <Zap size={14} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">
                            Ahorras comisiones ilimitadas
                        </span>
                    </div>
                </div>

                {/* SEPARATOR - Subtle Line */}
                <div className="h-px w-full bg-white/5" />

                {/* BENEFITS LIST */}
                <div className="space-y-4">
                    <ul className="space-y-3">
                        {plan.features.map((feat, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex items-start gap-3"
                            >
                                <CheckCircle2 size={16} className={`text-${plan.accent}-500 shrink-0 mt-0.5 opacity-80`} strokeWidth={2} />
                                <span className="text-sm text-zinc-300 font-light leading-relaxed">
                                    {feat}
                                </span>
                            </motion.li>
                        ))}
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={16} className={`text-${plan.accent}-500 shrink-0 mt-0.5 opacity-80`} strokeWidth={2} />
                            <span className="text-sm text-zinc-300 font-light leading-relaxed">
                                Cancelación inmediata sin penalidad
                            </span>
                        </li>
                    </ul>
                </div>

                {/* WARRANTY / FOOTER - Clean Text */}
                <div className="flex gap-3 opacity-60">
                    <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xs">
                        Renovación automática el {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Cancelable en cualquier momento.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PlanSummaryCard;
