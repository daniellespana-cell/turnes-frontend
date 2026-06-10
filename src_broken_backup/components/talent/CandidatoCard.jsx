import { useNavigate } from 'react-router-dom';

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

      <div className="p-6 relative z-10 flex flex-col h-full space-y-6">
        {/* --- 1. HEADER (Upscaled) --- */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={can.avatar || "https://ui-avatars.com/api/?name=" + can.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/5 shadow-2xl"
              alt={can.name}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-white truncate tracking-tight leading-none">
              {can.name}
            </h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-2">
               ID: {String(can.id).slice(-8)}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* --- 2. CALIFICACIÓN (Interactiva e Indestructible) --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Puntuación</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onUpdate(can.id, { rating: star })}
                  className="focus:outline-none transition-all hover:scale-125 active:scale-90"
                >
                  <Star
                    size={24}
                    fill={star <= (can.rating || 0) ? "#fbbf24" : "none"}
                    className={`transition-colors ${star <= (can.rating || 0)
                      ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                      : "text-zinc-800 hover:text-zinc-600"
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Asistencia */}
          <button
            onClick={() => onUpdate(can.id, { asistio: !can.asistio })}
            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${can.asistio
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
              : 'bg-zinc-900/50 border-white/5 text-zinc-600 hover:border-zinc-700'
              }`}
          >
            {can.asistio ? <CheckCircle2 size={16} /> : <X size={16} />}
            {can.asistio ? 'Asistencia Confirmada' : 'Confirmar Asistencia'}
          </button>
        </div>

        {/* --- 3. REPORTE --- */}
        <div className="space-y-3 flex-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Reporte de Desempeño</span>
          <textarea
            value={can.comentarioPublico || ""}
            onChange={(e) => onUpdate(can.id, { comentarioPublico: e.target.value })}
            placeholder="Describe el desempeño de este candidato..."
            className="w-full bg-zinc-950 border border-white/5 focus:border-emerald-500/30 rounded-2xl p-4 text-sm text-zinc-300 placeholder:text-zinc-800 outline-none transition-all resize-none min-h-[120px]"
          />
        </div>

        {/* --- 4. ACCIÓN FINAL --- */}
        <div className="pt-2">
          {can.justSent ? (
            <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 text-emerald-500">
              <ShieldCheck size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">Contrato Sellado</span>
            </div>
          ) : (
            <button
              onClick={() => onSellar(can.id, can.vacanteId || can.fromVacante)}
              disabled={!can.rating}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all text-[11px] font-black uppercase tracking-widest border shadow-2xl ${can.rating
                ? 'bg-white text-black border-transparent hover:bg-zinc-200 active:scale-[0.98]'
                : 'bg-zinc-900/50 text-zinc-700 border-zinc-800 cursor-not-allowed opacity-40'
                }`}
            >
              <Send size={16} />
              Sellar y Calificar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidatoCard;