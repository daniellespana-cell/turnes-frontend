import React from 'react';
import { ArrowRight, Crown } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumBanner = ({ currentPlan = 'Basic' }) => {
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState(false);

  const plan = (currentPlan || 'Basic').toLowerCase();
  const isPaidPlan = ['pro', 'enterprise'].some(p => plan.startsWith(p));

  const config = {
    basic: {
      savings: "$24.500",
      text: "Tu plan Básico es bueno, pero Pro desbloquea más.",
      target: "Pro"
    },
    micro: {
      savings: "$45.000",
      text: "Estás creciendo. Pásate a Pro para eliminar límites.",
      target: "Pro"
    },
    default: {
      savings: "$24.500",
      text: "Mejora tu plan para desbloquear funciones premium.",
      target: "Premium"
    }
  };

  const activeConfig = config[plan] || config.default;

  useEffect(() => {
    if (isPaidPlan) return;
    const interval = setInterval(() => {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaidPlan]);

  if (isPaidPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative border rounded-[2rem] p-6 space-y-5 overflow-hidden transition-all duration-1000 group ${highlight
        ? 'bg-amber-500/[0.03] border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]'
        : 'bg-[#0a0a0a] border-white/5'
        }`}
    >
      {/* Premium Gradient Shimmer */}
      <AnimatePresence>
        {highlight && (
          <motion.div
            key="premium-shimmer"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-12"
          />
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all duration-700 ${highlight ? 'bg-amber-500 text-black' : 'bg-amber-500/10 text-amber-500'}`}>
            <Crown size={14} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${highlight ? 'text-amber-400' : 'text-zinc-500'}`}>
            Sugerencia Inteligente
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${highlight ? 'bg-amber-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        <h3 className="text-white text-lg font-black leading-tight tracking-tight">
          Ahorros potenciales: <span className="text-amber-500">{activeConfig.savings}</span>
        </h3>
        <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-[280px]">
          {activeConfig.text}
        </p>
      </div>
      <button
        onClick={() => navigate("/dashboard/upgrade")}
        className={`w-full relative z-10 flex items-center justify-center gap-3 py-3 rounded-full text-[11px] font-bold tracking-wide transition-all duration-500 active:scale-[0.98] overflow-hidden group/btn ${highlight
          ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.5)]'
          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-transparent hover:border-amber-500/30 font-manrope'
          }`}
        type="button"
        aria-label="Acción">
        <span className="relative z-10">Actualizar a {activeConfig.target}</span>
        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
      </button>
      {/* Decorative Orbs */}
      <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full transition-opacity duration-1000 ${highlight ? 'opacity-100' : 'opacity-0'}`} />
    </motion.div>
  );
};

export default PremiumBanner;
