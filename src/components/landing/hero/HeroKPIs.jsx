import React from 'react';

const HeroKPIs = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="lg:hidden w-full pt-5 mt-5 border-t border-zinc-800/80">
        <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start space-y-0.5">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wider uppercase">Hasta</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#00f0ff] tracking-tight leading-none">100%</span>
            <span className="text-[11px] sm:text-xs text-zinc-300 font-normal pt-0.5">Sin comisión en 1er turno</span>
          </div>

          <div className="flex flex-col items-center sm:items-start space-y-0.5 border-l border-zinc-800/90 pl-4 sm:pl-6">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wider uppercase">Promedio</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#00f0ff] tracking-tight leading-none">&lt; 2h</span>
            <span className="text-[11px] sm:text-xs text-zinc-300 font-normal pt-0.5">Tiempo de cobertura</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block pt-5 mt-2 border-t border-zinc-800/80 w-full max-w-lg">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col space-y-0.5">
          <span className="text-[11px] sm:text-xs text-zinc-400 font-medium tracking-wider uppercase">Hasta</span>
          <span className="text-3xl lg:text-4xl font-extrabold text-[#00f0ff] tracking-tight leading-none">100%</span>
          <span className="text-xs sm:text-sm text-zinc-300 font-normal pt-1">Sin comisión en 1er turno</span>
        </div>

        <div className="flex flex-col space-y-0.5 border-l border-zinc-800/90 pl-8">
          <span className="text-[11px] sm:text-xs text-zinc-400 font-medium tracking-wider uppercase">Promedio</span>
          <span className="text-3xl lg:text-4xl font-extrabold text-[#00f0ff] tracking-tight leading-none">&lt; 2h</span>
          <span className="text-xs sm:text-sm text-zinc-300 font-normal pt-1">Tiempo de cobertura</span>
        </div>
      </div>
    </div>
  );
};

export default HeroKPIs;
