import React from 'react';
import typography from '../../styles/typography';


const VacantesTabs = ({ activeTab, setActiveTab, counts }) => {
  const tabs = ['Activa', 'Completada'];

  return (
    <div className="flex items-center gap-6 md:gap-8 pb-4 border-b border-white/5 overflow-x-auto no-scrollbar font-manrope">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const count = counts?.[tab] || 0;

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              relative pb-4 -mb-[17px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap group
              ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}
            `}
          >
            <span className="flex items-center gap-2">
              {tab}
              {count > 0 && (
                <span className={`text-[9px] ${isActive ? 'text-emerald-500' : 'text-zinc-700'}`}>
                  {count}
                </span>
              )}
            </span>

            {/* Active Line Indicator */}
            <div className={`absolute bottom-0 left-0 w-full h-[2px] transition-all duration-300 ${isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-transparent group-hover:bg-white/10'}`} />
          </button>
        );
      })}
    </div>
  );
};

export default VacantesTabs;