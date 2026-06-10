import React from 'react';

import { typography } from '../../styles/typography';

const TabSelector = ({ activeTab, setActiveTab, stats }) => {
  // Definimos las pestañas con su conteo
  const tabs = [
    { id: 'pendientes', label: 'Pendientes', count: stats.totalPendientes || 0 },
    { id: 'historial', label: 'Historial', count: stats.totalHistorial || 0 }
  ];

  return (
    <nav 
      className="flex bg-zinc-900/40 p-1.5 rounded-2xl border border-transparent backdrop-blur-xl  w-fit"
      aria-label="Filtro de candidatos"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        // Notificación sutil si hay historial nuevo y no estamos en esa pestaña
        const hasDiscovery = tab.id === 'historial' && tab.count > 0 && !isActive;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              ${typography.action} 
              px-6 py-2.5 rounded-xl transition-all duration-500 ease-out
              flex items-center gap-2.5 relative overflow-hidden whitespace-nowrap
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
              }
            `}
          >
            {/* Indicador de Punto Activo */}
            <div className="relative flex items-center justify-center">
              <div className={`
                w-1.5 h-1.5 rounded-full transition-all duration-500
                ${isActive ? 'bg-white' : (hasDiscovery ? 'bg-blue-400' : 'bg-zinc-800')}
                ${isActive && tab.id === 'pendientes' ? 'animate-pulse shadow-[0_0_8px_white]' : ''}
                ${hasDiscovery ? 'animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}
              `} />
              
              {/* Efecto Ping para el Historial (Revelación) */}
              {hasDiscovery && (
                <span className="absolute inset-0 flex h-full w-full">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                </span>
              )}
            </div>
            
            <span className="font-black uppercase tracking-[0.12em] text-[10px] md:text-[11px]">
              {tab.label}
            </span>
            
            {/* Contador */}
            <span className={`
              px-2 py-0.5 rounded-lg text-[9px] font-black transition-all duration-300
              ${isActive 
                ? 'bg-black/20 text-white' 
                : (hasDiscovery ? 'text-blue-400 bg-blue-500/10' : 'bg-zinc-900 text-zinc-600')
              }
            `}>
              {tab.count}
            </span>

            {/* Punto de rebote si hay novedades en el historial */}
            {hasDiscovery && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-black animate-bounce shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default TabSelector;