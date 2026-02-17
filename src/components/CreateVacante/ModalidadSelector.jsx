import React from 'react';
import { Clock, Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModalidadSelector = ({ selectedType, onChange }) => {
  const navigate = useNavigate();

  const modalidades = [
    { 
      id: 'temporal', 
      label: 'Turno Temporal', 
      icon: Clock, 
      info: 'Comisión 6%',
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
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
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
              className={`px-4 py-4 rounded-2xl border transition-all duration-500 flex items-center gap-3 text-left relative overflow-hidden group ${
                isActive 
                ? 'bg-white/[0.03] border-white/20 text-white' 
                : 'bg-transparent border-white/[0.05] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors duration-500 ${
                isActive ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-700'
              }`}>
                <mode.icon size={14} strokeWidth={2.5} />
              </div>

              <div className="flex-1">
                <p className="font-bold text-[12px] tracking-tight leading-none">
                  {mode.label}
                </p>
                <p className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-blue-400/70' : 'text-zinc-600'
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
      <div 
        className="flex items-center justify-between px-2 py-1 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
        onClick={() => navigate('/dashboard/upgrade')}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={12} className="text-purple-400" />
          <p className="text-[10px] font-medium text-zinc-400">
            Plan Básico <span className="mx-1.5 opacity-20">|</span> 
            <span className="text-zinc-200 group-hover:text-purple-400 transition-colors italic">Mejorar al Plan Micro</span>
          </p>
        </div>
        <ChevronRight size={12} className="text-zinc-700 group-hover:text-white transition-all" />
      </div>
    </section>
  );
};

export default ModalidadSelector;