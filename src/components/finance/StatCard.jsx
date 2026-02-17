import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-[#0f0f10] border border-white/5 p-5 rounded-2xl transition-all duration-300 hover:bg-[#0f0f10]/80 group">
      <div className="flex justify-between items-start mb-3">
        {/* Contenedor del Icono Minimal */}
        <div className={`p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 group-hover:text-white transition-colors ${colorClass.replace('text-', 'group-hover:text-')}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none">
          {title}
        </p>

        {/* Valor más limpio y elegante */}
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;