import React from 'react';
import { 
  ChevronLeft, 
  Clock, 
  DollarSign, 
  MapPin, 
  Zap 
} from 'lucide-react';
import SmartphoneFrame from '../SmartphoneFrame';

/**
 * PublicarTurnoMockup
 * Mockup de interfaz móvil de publicación express de vacante
 */
const PublicarTurnoMockup = () => {
  return (
    <SmartphoneFrame>
      {/* Cabecera de la App */}
      <div className="px-3.5 py-2 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1 text-zinc-800">
          <ChevronLeft size={18} className="stroke-[2.5]" />
          <span className="text-xs font-bold">Publicar Turno</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ⚡ Express
        </span>
      </div>

      {/* Formulario móvil */}
      <div className="p-3 space-y-2 text-left flex-1 bg-[#f9fafb]">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
          <span>Paso 1 de 2: Datos del turno</span>
          <span className="text-emerald-600 font-bold">75%</span>
        </div>
        <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
        </div>

        {/* Campo: Cargo */}
        <div className="bg-white p-2 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide block">Rol requerido</span>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">Mesero de Finde</span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              Gastronomía
            </span>
          </div>
        </div>

        {/* Campo: Horario */}
        <div className="bg-white p-2 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide block">Fecha y Horario</span>
          <div className="mt-0.5 flex items-center gap-1.5 text-zinc-800">
            <Clock size={12} className="text-emerald-600" />
            <span className="text-xs font-semibold">Hoy · 6:30 PM a 12:30 AM</span>
            <span className="text-[9px] text-zinc-400 ml-auto">(6 hrs)</span>
          </div>
        </div>

        {/* Campo: Pago */}
        <div className="bg-white p-2 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide">Pago al finalizar</span>
            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">0% comisión</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-emerald-600 font-black text-xs">
            <DollarSign size={13} className="stroke-[2.5]" />
            <span>$70.000 COP</span>
            <span className="text-[9px] text-zinc-500 font-normal ml-1">· Pago directo</span>
          </div>
        </div>

        {/* Campo: Ubicación */}
        <div className="bg-white p-2 rounded-xl border border-zinc-200/80 shadow-xs">
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide block">Ubicación</span>
          <div className="mt-0.5 flex items-center gap-1.5 text-zinc-800">
            <MapPin size={12} className="text-blue-600 shrink-0" />
            <span className="text-[11px] font-medium text-zinc-700 truncate">Cabecera · Bucaramanga</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-medium mt-0.5 block">
            ● 42 meseros activos a &lt; 3 km
          </span>
        </div>

        {/* Botón de Publicar */}
        <div className="pt-1">
          <div className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] text-center tracking-wide uppercase shadow-md flex items-center justify-center gap-1.5">
            <Zap size={12} className="fill-white" />
            <span>Publicar Turno Inmediato</span>
          </div>
        </div>
      </div>
    </SmartphoneFrame>
  );
};

export default PublicarTurnoMockup;
