import React from 'react';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight } from 'lucide-react';


// Variantes de animación (Asumimos que están definidas en un lugar central o aquí)
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Componente atómico para renderizar una característica
const FeatureItem = ({ feature, listIcon }) => (
    <li className="flex items-start text-zinc-300">
        {listIcon}
        <span className="text-sm font-medium">{feature}</span>
    </li>
);

/**
 * Componente que renderiza una tarjeta de plan de suscripción (Básico, Micro, Pro).
 * @param {object} plan - Objeto del plan de suscripción (datos del Canvas companyPlans.js).
 */
const PricingCard = ({ plan }) => {
    const isMicro = plan.name === 'Micro'; // Identifica el plan destacado

    // 🟢 Estilos para el tema Oscuro
    const listIcon = isMicro
        ? <Check className="w-5 h-5 text-black mr-2 flex-shrink-0" />
        : <Check className="w-5 h-5 text-brand-success mr-2 flex-shrink-0" />;

    return (
        <motion.div
            variants={fadeInUp}
            className={`
              flex flex-col rounded-3xl transition-all duration-300 transform
              ${isMicro ? 'bg-zinc-900/80 scale-[1.02]' : 'bg-zinc-900/40 hover:scale-[1.02]'}
            `}
            whileHover={{ y: -5 }}
        >

            {/* Etiqueta Popular */}
            {plan.isPopular && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 z-10">
                    <div className="bg-emerald-400 text-black text-xs font-bold uppercase py-1 px-3 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] transform rotate-6 flex items-center gap-1">
                        <Star size={12} fill="black" className="text-black" /> POPULAR
                    </div>
                </div>
            )}

            {/* Header del Plan */}
            <div className={`p-8 rounded-t-3xl ${isMicro ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                <h2 className={`text-xl font-bold mb-2 ${isMicro ? 'text-emerald-400' : 'text-white'}`}>{plan.name}</h2>
                <p className="mt-2 text-sm text-zinc-400 min-h-[40px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black tracking-tight text-white">{plan.price}</span>
                    <span className="ml-2 text-sm font-medium text-zinc-500">{plan.frequency}</span>
                </div>
            </div>

            {/* Body / Features */}
            <div className="p-8 flex flex-col justify-between flex-grow rounded-b-3xl">
                <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                        <FeatureItem key={i} feature={feature} listIcon={listIcon} />
                    ))}
                </ul>

                {/* Button CTA */}
                <div className="mt-8">
                    <Link
                        to={plan.linkTo}
                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md transition-colors duration-200 
                          ${plan.buttonClass} ${isMicro ? 'text-black' : 'text-white'}`}
                        aria-label={`Seleccionar Plan ${plan.name}`}
                    >
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default PricingCard;