import React from 'react';
import { Zap } from 'lucide-react';


const ImpulsoSwitch = ({ isUrgent, onChange, precio = 7000 }) => {
  return (
    <div className="bg-zinc-900/60 rounded-[2rem] p-6 relative overflow-hidden group transition-all font-manrope">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              isUrgent
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            <Zap size={18} fill={isUrgent ? 'currentColor' : 'none'} />
          </div>

          <span className="text-base font-extrabold uppercase tracking-tight text-zinc-100">
            Impulsa tu oferta
          </span>
        </div>

        {/* SWITCH TIPO IOS 2026 */}
        <div
          onClick={() => onChange(!isUrgent)}
          className={`relative w-16 h-8 rounded-full cursor-pointer transition-all duration-500 p-1 shadow-inner ${
            isUrgent
              ? 'bg-gradient-to-r from-blue-600 to-purple-600'
              : 'bg-zinc-800'
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.3)] transition-all duration-500 cubic-bezier(0.68, -0.55, 0.27, 1.55) transform ${
              isUrgent ? 'translate-x-8 scale-110' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-zinc-400 leading-snug font-medium">
          Prioridad máxima: tu vacante aparecerá en el top de búsquedas durante 24 horas.
        </p>

        <div className="flex items-end gap-2 mt-4">
          <span
            className={`text-2xl font-black tracking-tight ${
              isUrgent ? 'text-orange-500 animate-pulse' : 'text-zinc-600'
            }`}
          >
            + ${new Intl.NumberFormat('es-CO').format(precio)}
          </span>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            COP
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImpulsoSwitch;
