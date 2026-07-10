import React from 'react';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const FeatureItem = ({ feature, highlight = false }) => (
    <li className="flex items-start gap-3">
        <div className={`mt-1 p-0.5 rounded-full ${highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <Check size={12} strokeWidth={4} />
        </div>
        <span className={`text-sm ${highlight ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>{feature}</span>
    </li>
);

const PagePricingCard = ({ plan, userLoggedIn }) => {
    const isPopular = plan.isPopular;
    const isPro = plan.id === 'pro';

    // Formatting Price
    const priceFormatted = plan.priceValue === 0 ? "Gratis" : formatCurrency(plan.priceValue).replace(',00', '');
    const suffix = plan.priceValue === 0 ? "PARA SIEMPRE" : "PESOS / MES";

    // Formatting Commission
    const commissionText = `${plan.commissionRate * 100}% por turno`;

    // Static features list
    const featuresList = plan.features || [];

    // Link Logic
    const linkTo = userLoggedIn ? `/dashboard/upgrade` : '/register';

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`
                relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 h-full
                ${isPopular
                    ? 'bg-zinc-900 border-2 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] z-10 scale-105 md:scale-110'
                    : 'bg-zinc-900/50 border border-transparent  hover:bg-zinc-900/80'
                }
            `}
        >
            {isPopular && (
                <div className="absolute top-0 inset-x-0 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest text-center py-1">
                    Más Vendido
                </div>
            )}

            <div className="p-8 pb-4">
                <h3 className={`text-lg font-bold mb-2 ${isPopular ? 'text-emerald-400' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black text-white tracking-tighter uppercase">{priceFormatted}</span>
                </div>
                <span className="text-xs font-bold text-zinc-500 block mb-2">{suffix}</span>

                <p className="text-sm font-medium text-emerald-400 mb-2">{commissionText}</p>
                <p className="text-xs text-zinc-500 leading-relaxed h-10 line-clamp-2">{plan.description}</p>
            </div>

            <div className="p-8 pt-4 flex flex-col flex-grow">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6"></div>

                <ul className="space-y-4 mb-8 flex-grow">
                    {featuresList.map((feature, i) => (
                        <FeatureItem key={i} feature={feature} highlight={isPopular || isPro} />
                    ))}
                </ul>

                <Link
                    to={linkTo}
                    className={`
                        w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 group
                        bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/25
                    `}
                >
                    {plan.priceValue === 0 ? "Comenzar Gratis" : "Elegir Plan"} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

export default PagePricingCard;
