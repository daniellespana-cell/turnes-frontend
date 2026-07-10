import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

import { Clock, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModalidadSelector = ({ selectedType, onChange, userPlan = 'Plan Básico', userCommission = '6%' }) => {
  const navigate = useNavigate();

  const isMaxPlan = userPlan?.toLowerCase().includes('pro');
  const isBasicPlan = userPlan?.toLowerCase().includes('básico') || userPlan?.toLowerCase().includes('basic');
  const nextPlanName = isBasicPlan ? 'Micro' : 'Pro';

  const formattedCommission = typeof userCommission === 'number' 
    ? `${userCommission * 100}%` 
    : userCommission; // Fallback in case it's already a string like '6%'

  const modalidades = [
    { 
      id: 'temporal', 
      label: 'Turno Temporal', 
      icon: Clock, 
      info: `Comisión ${formattedCommission}`,
    },
    { 
      id: 'fijo', 
      label: 'Empleo Fijo', 
      icon: Briefcase, 
      info: 'Publicación Fija',
    }
  ];

  return (
    <section className="space-y-6 font-manrope">
      {/* Label de sección ultra sutil */}
      <div className="flex items-center gap-2 ml-1 opacity-40">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          01. Modalidad
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modalidades.map((mode) => {
          const isActive = selectedType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`px-5 py-5 rounded-2xl transition-all duration-500 flex items-center gap-4 text-left relative overflow-hidden group ${
                isActive 
                ? 'bg-white/[0.04] text-white ring-1 ring-white/10' 
                : 'bg-transparent text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300'
              }`}
              type="button"
              aria-label="Acción">
              <div className={`p-2.5 rounded-xl transition-colors duration-500 ${
                isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/[0.05] text-zinc-500'
              }`}>
                <mode.icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base tracking-tight leading-none">
                  {mode.label}
                </p>
                <p className={`text-sm mt-1.5 font-medium ${
                  isActive ? ((userCommission === 0 || userCommission === '0%') ? 'text-emerald-400 font-bold' : 'text-blue-400/80') : 'text-zinc-500'
                }`}>
                  {mode.info}
                </p>
              </div>
              {/* Indicador de activo sutil */}
              {isActive && (
                <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
              )}
            </button>
          );
        })}
      </div>
      {/* Upgrade: Menos banner, más invitación sutil */}
      {!isMaxPlan ? (
        <div 
          className="flex items-center justify-between px-2 py-1 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => navigate('/dashboard/upgrade')}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-purple-400" />
            <p className="text-xs font-medium text-zinc-400">
              {userPlan} <span className="mx-1.5 opacity-20">|</span> 
              <span className="text-zinc-200 group-hover:text-purple-400 transition-colors italic">Mejorar al Plan {nextPlanName}</span>
            </p>
          </div>
          <ChevronRight size={14} className="text-zinc-700 group-hover:text-white transition-all" />
        </div>
      ) : (
        <div className="flex items-center justify-between px-2 py-1 opacity-60">
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-emerald-400" />
            <p className="text-xs font-medium text-emerald-400/80">
              {userPlan} <span className="mx-1.5 opacity-20">|</span> 
              <span className="italic">Nivel Máximo Desbloqueado</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ModalidadSelector;