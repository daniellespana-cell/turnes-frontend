import React from 'react';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * Symmetrical 4-point concave sparkle star matching Turnes brand asset
 */
const SparkleStar = ({ size = 16, className = "text-cyan-400" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`inline-block shrink-0 ${className}`}
        aria-hidden="true"
    >
        <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
    </svg>
);

const PagePricingCard = ({ plan, userLoggedIn }) => {
    const isPopular = Boolean(plan.isPopular);
    const isPro = plan.id === 'pro';

    // Formatting Price
    const priceFormatted = plan.priceValue === 0 
        ? "Gratis" 
        : formatCurrency(plan.priceValue).replace(',00', '');

    // Static features list
    const featuresList = plan.features || [];

    // CTA Text & Link logic
    const ctaText = userLoggedIn
        ? (plan.cta?.private || 'Tu Plan')
        : (plan.cta?.public || (plan.priceValue === 0 ? 'Comenzar Gratis' : 'Elegir Plan'));

    const linkTo = userLoggedIn
        ? (plan.cta?.linkPrivate && plan.cta.linkPrivate !== '#' ? plan.cta.linkPrivate : '/dashboard/upgrade')
        : (plan.cta?.linkPublic || '/register');

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className={`
                relative flex flex-col rounded-3xl transition-all duration-300 h-full
                ${isPopular
                    ? 'bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border-2 border-cyan-500/60 shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)] z-10 scale-[1.02] md:scale-105'
                    : 'bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 shadow-lg shadow-black/40'
                }
            `}
        >
            {/* Ambient inner glow */}
            {isPopular ? (
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            ) : isPro ? (
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            ) : null}

            {/* Popular Floating Badge */}
            {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/25">
                        <SparkleStar size={11} className="text-zinc-950" />
                        Más Elegido
                        <SparkleStar size={11} className="text-zinc-950" />
                    </span>
                </div>
            )}

            {/* Decorative Corner Stars */}
            <div className="absolute top-5 right-5 pointer-events-none flex items-center gap-1">
                {isPopular ? (
                    <div className="relative">
                        <SparkleStar size={22} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        <SparkleStar size={10} className="text-emerald-300 absolute -top-1 -right-2 opacity-80" />
                    </div>
                ) : isPro ? (
                    <div className="relative">
                        <SparkleStar size={20} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                        <SparkleStar size={9} className="text-purple-300 absolute -top-1 -right-2 opacity-70" />
                    </div>
                ) : (
                    <SparkleStar size={16} className="text-zinc-700" />
                )}
            </div>

            {/* Header Section */}
            <div className="p-7 sm:p-8 pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {isPopular && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                            <SparkleStar size={8} className="text-cyan-400" />
                            Ahorro
                        </span>
                    )}
                    {isPro && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                            <SparkleStar size={8} className="text-indigo-400" />
                            Ilimitado
                        </span>
                    )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed min-h-[34px] mb-5">
                    {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                            {priceFormatted}
                        </span>
                        {plan.priceValue > 0 ? (
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                COP / mes
                            </span>
                        ) : (
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                Para siempre
                            </span>
                        )}
                    </div>
                </div>

                {/* Commission Pill / Rate Highlight */}
                <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                    isPopular 
                        ? 'bg-cyan-500/10 border-cyan-500/30' 
                        : isPro 
                            ? 'bg-indigo-500/10 border-indigo-500/30' 
                            : 'bg-zinc-800/40 border-zinc-800/80'
                }`}>
                    <div className="flex items-center gap-2">
                        <SparkleStar 
                            size={13} 
                            className={isPopular ? 'text-cyan-400' : isPro ? 'text-indigo-400' : 'text-zinc-500'} 
                        />
                        <span className="text-xs font-medium text-zinc-300">Comisión por turno</span>
                    </div>
                    <span className={`text-sm font-extrabold ${
                        isPopular ? 'text-cyan-300' : isPro ? 'text-indigo-300' : 'text-emerald-400'
                    }`}>
                        {plan.commissionRate === 0 ? "0%" : `${plan.commissionRate * 100}%`}
                    </span>
                </div>
            </div>

            {/* Features & CTA Section */}
            <div className="p-7 sm:p-8 pt-2 flex flex-col flex-grow relative z-10">
                <div className="w-full h-px bg-zinc-800/80 mb-6" />

                <ul className="space-y-3.5 mb-8 flex-grow">
                    {featuresList.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className={`mt-0.5 shrink-0 ${
                                isPopular 
                                    ? 'text-cyan-400' 
                                    : isPro 
                                        ? 'text-indigo-400' 
                                        : 'text-emerald-400'
                            }`}>
                                {i === 0 ? (
                                    <SparkleStar size={14} className="drop-shadow-[0_0_6px_currentColor]" />
                                ) : (
                                    <Check size={15} strokeWidth={2.8} />
                                )}
                            </div>
                            <span className={`text-sm leading-snug ${
                                i === 0 ? 'text-zinc-100 font-medium' : 'text-zinc-300'
                            }`}>
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                {isPopular ? (
                    <Link
                        to={linkTo}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 group bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-zinc-950 hover:brightness-110 shadow-lg shadow-cyan-500/25"
                    >
                        <span>{ctaText}</span>
                        <SparkleStar size={12} className="text-zinc-950 group-hover:rotate-45 transition-transform duration-300" />
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : isPro ? (
                    <Link
                        to={linkTo}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 group bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg shadow-white/10"
                    >
                        <span>{ctaText}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <Link
                        to={linkTo}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 group bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700/80"
                    >
                        <span>{ctaText}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

export default PagePricingCard;
