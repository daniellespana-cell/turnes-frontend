import React from 'react';
import { 
  Clock, 
  DollarSign, 
  Zap,
  Star,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import PublicarTurnoMockup from './mockups/PublicarTurnoMockup';

/**
 * StepPublicarTurno (Paso 1)
 * Tarjeta blanca modular que orquesta la explicación y el mockup de publicación express
 */
const StepPublicarTurno = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900">
      {/* Contenido explicativo */}
      <div className="lg:col-span-6 space-y-4">
        {/* Badges de Paso y Estrellas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Clock size={13} />
            Paso 1 · Publicación Inmediata
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
            <div className="flex text-amber-400">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold">4.9/5</span>
            <span className="text-zinc-500 font-normal">satisfacción</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight leading-tight">
          Crea tu vacante en menos de 2 minutos
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed">
          Solo debes ingresar el cargo requerido, el horario del turno y el valor que pagarás directamente al colaborador al terminar la jornada. Sin contratos forzosos ni procesos burocráticos.
        </p>
        
        <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-zinc-700">
          <div className="flex items-start gap-2.5">
            <Zap size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Publicación instantánea:</strong> Notificación automática a meseros y cocineros activos en tu zona geográfica.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <DollarSign size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Pago directo transparente:</strong> 0% de comisiones abusivas para el trabajador.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Sin trámites eternos:</strong> Disponible desde tu smartphone cuando surge la emergencia.
            </span>
          </div>
        </div>

        {/* Micro-tarjetas con iconos ligeros */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Clock size={15} className="text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">&lt; 2 min</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Publicación</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <ShieldCheck size={15} className="text-blue-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">100% Cédula</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Verificado</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Star size={15} className="text-amber-500 fill-amber-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">0% Comisión</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Para el talento</span>
          </div>
        </div>
      </div>

      {/* Mockup Móvil Modular */}
      <div className="lg:col-span-6 flex justify-center items-center py-2">
        <PublicarTurnoMockup />
      </div>
    </div>
  );
};

export default StepPublicarTurno;
