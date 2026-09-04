import React from 'react';

/**
 * SmartphoneFrame
 * Marco móvil hiperrealista (estilo iPhone) para mockups de producto
 */
const SmartphoneFrame = ({ children }) => {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[305px]">
      {/* Botones físicos laterales del chasis de titanio */}
      <div className="absolute -left-[3px] top-[95px] w-[3px] h-[22px] bg-zinc-600 rounded-l-sm z-10" />
      <div className="absolute -left-[3px] top-[135px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm z-10" />
      <div className="absolute -left-[3px] top-[185px] w-[3px] h-[40px] bg-zinc-600 rounded-l-sm z-10" />
      <div className="absolute -right-[3px] top-[140px] w-[3px] h-[52px] bg-zinc-600 rounded-r-sm z-10" />

      {/* Cuerpo exterior del teléfono (chasis con borde de titanio y sombra profunda) */}
      <div className="relative rounded-[44px] p-[8px] sm:p-[10px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.4)]">
        {/* Marco interior negro del bisel */}
        <div className="rounded-[38px] overflow-hidden bg-zinc-950 p-[2.5px] ring-1 ring-black/90 shadow-2xl">
          {/* Pantalla retina del smartphone */}
          <div className="relative rounded-[34px] bg-white text-zinc-900 overflow-hidden flex flex-col min-h-[490px] sm:min-h-[510px] select-none shadow-inner">
            
            {/* Barra de Estado Superior e Isla Dinámica */}
            <div className="pt-3 px-6 pb-2 flex items-center justify-between z-30 relative bg-white">
              <span className="text-[12px] font-semibold tracking-tight text-zinc-900 pl-1 font-mono">9:41</span>
              
              {/* Dynamic Island pill */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 bg-black rounded-full flex items-center justify-between px-3 shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-[#151515] border border-zinc-800/80 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/60" />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              {/* Iconos de señal, wifi y batería */}
              <div className="flex items-center gap-1.5 text-zinc-900 pr-1">
                {/* Señal móvil */}
                <div className="flex items-end gap-[1.5px] h-3">
                  <div className="w-[3px] h-1.5 bg-zinc-900 rounded-[1px]" />
                  <div className="w-[3px] h-2 bg-zinc-900 rounded-[1px]" />
                  <div className="w-[3px] h-2.5 bg-zinc-900 rounded-[1px]" />
                  <div className="w-[3px] h-3 bg-zinc-900 rounded-[1px]" />
                </div>
                {/* Batería */}
                <div className="w-5 h-2.5 rounded-[4px] border border-zinc-800 p-0.5 flex items-center ml-0.5">
                  <div className="h-full w-[80%] bg-zinc-900 rounded-[2px]" />
                </div>
              </div>
            </div>

            {/* Contenido dinámico de la app */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
              {children}
            </div>

            {/* Barra de inicio inferior (Home Indicator) */}
            <div className="py-2 flex justify-center bg-white">
              <div className="w-28 h-1 bg-zinc-900/80 rounded-full" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartphoneFrame;
