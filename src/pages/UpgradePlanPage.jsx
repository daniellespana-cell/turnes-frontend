import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Crown } from 'lucide-react';
import { companyPlans } from '../data/companyPlans';
import { useAuth } from '../context/AuthContext';

// Color & Gradient Mappings
const planStyles = {
  basic: {
    gradient: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    icon: Shield,
    iconColor: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]",
    buttonGradient: "from-zinc-600 to-zinc-500 hover:from-zinc-500 hover:to-zinc-400" // Solid Metallic
  },
  micro: {
    gradient: "from-indigo-900/40 to-indigo-950/40", // Glassy Indigo
    border: "border-indigo-500/30",
    icon: Zap,
    iconColor: "text-indigo-400",
    glow: "group-hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.2)]",
    buttonGradient: "from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400" // Vibrant Indigo-Blue
  },
  pro: {
    gradient: "from-purple-900/40 via-fuchsia-900/20 to-pink-900/40",
    border: "border-purple-500/30",
    icon: Crown,
    iconColor: "text-purple-400",
    glow: "group-hover:shadow-[0_0_50px_-5px_rgba(168,85,247,0.3)]",
    buttonGradient: "from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-500 hover:to-pink-400" // Electric Purple-Pink
  }
};

const UpgradePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = (planId) => {
    navigate(`/plan-action/${planId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    // Removed bg-black, let it be transparent or inherited from BusinessLayout
    <div className="py-8 md:py-12 px-4 min-h-full font-manrope">

      {/* Dynamic Background Hints */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <header className="mb-8 md:mb-12 text-center relative z-10 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 backdrop-blur-md">
            Planes & Precios
          </span>
          <h2 className="mt-4 text-xl md:text-2xl font-bold text-white tracking-tight">
            Desbloquea el máximo potencial de tu empresa.
          </h2>
        </motion.div>
      </header>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10" // Removed pt-8 as header is back
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {companyPlans.map((plan) => {
          const styles = planStyles[plan.id] || planStyles.basic;
          const Icon = styles.icon;
          const isCurrent = user?.planId === plan.id;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              className={`group relative flex flex-col h-full rounded-3xl border ${styles.border} bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 ${styles.glow} overflow-hidden`}
            >

              {/* Gradient Background Overlay + CONTINUOUS SHIMMER/ESTELA */}
              <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />

              {/* ESTELA DE BRILLO (Card Shimmer) */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none z-0" />

              {/* Content Container */}
              <div className="relative p-5 md:p-6 flex flex-col h-full"> {/* Reduced padding */}

                {/* Header - Compact */}
                <div className="flex justify-between items-start mb-4"> {/* Reduced margin */}
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${styles.iconColor}`}>
                    <Icon size={20} /> {/* Smaller icon */}
                  </div>
                  {plan.isPopular && (
                    <span className="py-0.5 px-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                      Más Popular
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">{plan.name}</h3> {/* Compact text */}
                <p className="text-zinc-400 text-[11px] leading-relaxed mb-4 h-8 line-clamp-2"> {/* Smaller text, fixed height */}
                  {plan.description}
                </p>

                {/* Price - Compact */}
                <div className="mb-6 p-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-zinc-500 ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                      / mes
                    </span>
                  </div>
                </div>

                {/* Features - Compact */}
                <ul className="space-y-2.5 mb-6 flex-grow"> {/* Reduced gap */}
                  {plan.features.map((feat, i) => (
                    <li key={i} className="text-[13px] text-zinc-300 flex items-start gap-2.5 group/item">
                      <div className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-colors duration-300">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className="group-hover:text-white transition-colors duration-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - VIBRANT */}
                <button
                  onClick={() => !isCurrent && handleUpgrade(plan.id)}
                  disabled={isCurrent}
                  className={`relative w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden group/btn shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${isCurrent
                    ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700 shadow-none'
                    : `bg-gradient-to-r ${styles.buttonGradient} text-white border border-white/10`
                    }`}
                >
                  <span className="relative z-10 drop-shadow-md">
                    {isCurrent ? "Plan Actual" : plan.cta.private || "Seleccionar"}
                  </span>
                  {!isCurrent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite]" />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default UpgradePlanPage;