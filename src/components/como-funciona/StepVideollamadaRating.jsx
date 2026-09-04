import React from 'react';
import { 
  Video, 
  Star, 
  CheckCircle2, 
  Award 
} from 'lucide-react';
import VideollamadaRatingMockup from './mockups/VideollamadaRatingMockup';

/**
 * StepVideollamadaRating (Paso 3)
 * Tarjeta blanca modular que orquesta la explicación y el mockup de videollamada HD y calificación post-turno
 */
const StepVideollamadaRating = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900">
      {/* Contenido explicativo */}
      <div className="lg:col-span-6 space-y-4">
        {/* Badges de Paso y Estrellas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Video size={13} />
            Paso 3 · Filtro Express y Calificación
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
            <div className="flex text-amber-400">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <Star size={11} className="fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold">5.0 ★</span>
            <span className="text-zinc-500 font-normal">reputación real</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight leading-tight">
          Videollamada en vivo y reputación real
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed">
          Si necesitas validar la presentación o actitud del colaborador antes de que asista a tu local, activa una <strong>videollamada express de 2 minutos dentro del chat</strong>. Al finalizar la jornada, califícalo con estrellas para consolidar su historial y garantizar la calidad en Turnes.
        </p>

        <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-zinc-700">
          <div className="flex items-start gap-2.5">
            <Video size={17} className="text-purple-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Entrevistas instantáneas:</strong> Conoce al candidato sin enlaces externos ni descargas de apps.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Star size={17} className="text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Sistema de estrellas recíproco:</strong> Evalúa puntualidad, servicio y actitud con reseñas reales.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Pago directo garantizado:</strong> Liquidación directa sin retenciones de plataforma.
            </span>
          </div>
        </div>

        {/* Micro-tarjetas con iconos ligeros */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Video size={15} className="text-purple-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">2 Minutos</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Video express</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Star size={15} className="text-amber-500 fill-amber-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">5 Estrellas</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Evaluación mutua</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <Award size={15} className="text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-zinc-900 block">100% Pago</span>
            <span className="text-[10px] text-zinc-500 block leading-tight">Directo en mano</span>
          </div>
        </div>
      </div>

      {/* Mockup Móvil Modular */}
      <div className="lg:col-span-6 flex justify-center items-center py-2">
        <VideollamadaRatingMockup />
      </div>
    </div>
  );
};

export default StepVideollamadaRating;
