import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Send, Lock, Check, X, ShieldCheck } from 'lucide-react';

const CandidatoCard = ({ can, onUpdate, onSellar }) => {
  const navigate = useNavigate();
  const isRehire = can.estadoTurno === 'AGENDADO';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-[#09090b] border rounded-2xl overflow-hidden flex flex-col transition-all duration-300
        ${can.justSent
          ? 'border-emerald-500/30'
          : isRehire ? 'border-indigo-500/20' : 'border-white/5 hover:border-zinc-700'
        }`}
    >
      {/* Indicador sutil de proceso */}
      {can.justSent && <div className="absolute inset-0 bg-emerald-500/[0.02] z-0" />}

      <div className="p-3 relative z-10 space-y-3">

        {/* --- 1. HEADER COMPACTO (Avatar + Info) --- */}
        <div className="flex items-center gap-3">
          <img
            src={can.avatar || "https://via.placeholder.com/150"}
            className="w-8 h-8 rounded-lg object-cover grayscale-[0.3]"
            alt={can.name}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-zinc-200 truncate leading-tight">
              {can.name}
            </h3>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
              {isRehire ? 'Recontratación' : `ID: ${String(can.id).slice(-4)}`}
            </p>
          </div>
        </div>

        {/* Separador invisible */}
        <div className="h-px bg-zinc-800/50" />

        {/* --- 2. ACCIONES EN UNA SOLA FILA (Estrellas + Asistencia) --- */}
        <div className="flex items-center justify-between">
          {/* Estrellas Amarillas */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={can.justSent}
                onClick={() => onUpdate(can.id, { rating: star })}
                className="focus:outline-none hover:scale-110 transition-transform"
              >
                <Star
                  size={13}
                  fill={star <= (can.rating || 0) ? "currentColor" : "none"}
                  className={`transition-colors ${star <= (can.rating || 0)
                    ? "text-yellow-400"
                    : "text-zinc-800 hover:text-zinc-600"
                    }`}
                />
              </button>
            ))}
          </div>

          {/* Toggle Asistencia Compacto */}
          <button
            onClick={() => onUpdate(can.id, { asistio: !can.asistio })}
            disabled={can.justSent}
            className={`h-5 px-2 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${can.asistio
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
              }`}
          >
            {can.asistio ? <Check size={8} /> : <X size={8} />}
            {can.asistio ? 'Asistió' : 'Ausente'}
          </button>
        </div>

        {/* --- 3. INPUT COMPACTO --- */}
        <input
          value={can.comentarioPublico || ""}
          disabled={can.justSent}
          onChange={(e) => onUpdate(can.id, { comentarioPublico: e.target.value })}
          placeholder="Escribe un reporte breve..."
          className="w-full bg-zinc-900/50 text-[10px] text-zinc-300 placeholder:text-zinc-700 border border-transparent focus:border-zinc-700 rounded-lg px-2 h-7 outline-none transition-all"
        />

        {/* --- 4. BOTÓN SLIM (Separado y Color Morado-Esmeralda) --- */}
        <div className="pt-2"> {/* 🔥 Separación extra aquí */}
          {can.justSent ? (
            <div className="w-full h-7 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-center gap-1.5 text-emerald-600 cursor-default">
              <ShieldCheck size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Sellado</span>
            </div>
          ) : (
            <button
              onClick={() => onSellar(can.id, can.vacanteId || can.fromVacante)}
              disabled={!can.rating}
              className={`w-full h-7 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-widest border ${can.rating
                // 🔥 GRADIENTE MORADO ESMERALDADO
                ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white border-transparent hover:brightness-110 shadow-lg shadow-purple-900/20 active:scale-[0.98]'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                }`}
            >
              <Send size={10} className={can.rating ? "text-white" : "text-zinc-600"} />
              Calificar y Sellar
            </button>
          )}
        </div>

        {/* Footer minúsculo */}
        <div className="flex justify-center pt-0 opacity-20">
          <Lock size={6} />
        </div>
      </div>
    </motion.div>
  );
};

export default CandidatoCard;