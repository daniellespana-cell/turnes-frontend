import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const PremiumBanner = ({ currentPlan = 'Basic' }) => {
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState(false);

  // Normalizar plan para evitar errores de case
  const plan = (currentPlan || 'Basic').toLowerCase();

  // 1. Lógica Smart: Si es PRO o Enterprise, no molestamos al usuario (Dashboard Limpio)
  const isPaidPlan = ['pro', 'enterprise'].some(p => plan.startsWith(p));
  if (isPaidPlan) return null;

  // 2. Configuración Dinámica del Mensaje (Upselling Inteligente)
  const config = {
    // Caso: Usuario Gratuito o Básico -> Objetivo: Micro o Pro
    basic: {
      savings: "$24.500",
      text: "Tu plan Básico es bueno, pero Pro desbloquea más.",
      target: "Pro"
    },
    // Caso: Usuario Micro -> Objetivo: Pro
    micro: {
      savings: "$45.000",
      text: "Estás creciendo. Pásate a Pro para eliminar límites.",
      target: "Pro"
    },
    // Fallback
    default: {
      savings: "$24.500",
      text: "Mejora tu plan para desbloquear funciones premium.",
      target: "Premium"
    }
  };

  const activeConfig = config[plan] || config.default;

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative border rounded-2xl p-5 space-y-4 overflow-hidden transition-all duration-700 group ${highlight
      ? 'bg-gradient-to-br from-blue-900/30 to-emerald-900/30 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      : 'bg-gradient-to-br from-blue-900/10 to-emerald-900/10 border-blue-500/10'
      }`}>

      {/* Efecto de brillo pasante */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-1000 ${highlight ? 'translate-x-[200%]' : ''
        }`} />

      <div className="flex items-center gap-2 text-blue-400/80">
        <Sparkles size={14} className={highlight ? "animate-pulse text-blue-300" : ""} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Sugerencia Inteligente</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-white text-base font-bold leading-tight relative z-10">
          Ahorros potenciales: {activeConfig.savings}
        </h3>
        <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
          {activeConfig.text}
        </p>
      </div>

      <button
        onClick={() => navigate("/dashboard/upgrade")}
        className="w-full relative z-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 overflow-hidden group/btn"
      >
        {/* Estela Esmeralda en el Botón */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-x-full transition-transform duration-1000 ${highlight ? 'translate-x-[200%]' : ''
          }`} />

        <span className="relative z-10">Ver Planes {activeConfig.target}</span>
        <ArrowRight size={12} className="opacity-60 relative z-10" />
      </button>
    </div>
  );
};

export default PremiumBanner;