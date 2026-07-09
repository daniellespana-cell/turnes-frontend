import React from 'react';
import { ShieldCheck, Star, Lock, MessageSquare, ShieldAlert, Sparkles, CheckCircle2, Heart, X } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { typography } from '../../styles/typography';
import { logger } from '../../utils/logger';
import { AssetResolver } from '../../utils/assetHelper';

const CandidatoRow = ({ can, onDismiss }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(can.isFavorite || false);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    // 🧠 SENIOR NOTE: La persistencia de favoritos se ha movido al Servidor.
    // TODO: Implementar CandidateService.toggleFavorite(can.id, newFavoriteStatus)
    logger.info(`[Audit] Syncing favorite status for ${can.id}: ${newFavoriteStatus}`);
  };

  return (
    <div key={can.id} className="flex flex-col bg-[#050505] border border-transparent rounded-2xl p-3 md:p-4 group animate-in slide-in-from-right-2  transition-all overflow-hidden relative">

      {/* CONTENIDO PRINCIPAL DE LA FILA */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 relative z-10">

        {/* AVATAR + CORAZÓN INTEGRADO */}
        <div className="relative shrink-0 group/avatar">
          <img 
            src={AssetResolver.getAvatar(can.avatar, can.name || 'Candidato')} 
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover transition-all border border-white/5" 
            alt="" 
          />
          <button
            onClick={toggleFavorite}
            className={`absolute -top-1.5 -left-1.5 p-2 rounded-full border transition-all duration-300  ${isFavorite
              ? "bg-purple-600 border-purple-400 scale-110"
              : "bg-zinc-900 border-white/10 group-hover/avatar:border-purple-500/50"
              }`}
          >
            <Heart
              size={16}
              className={`${isFavorite ? "text-white fill-white" : "text-zinc-600 group-hover/avatar:text-purple-400"}`}
            />
          </button>
        </div>

        {/* INFO PRINCIPAL (Nombre) */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center gap-2">
            <h3 className={`${typography.modalEntityName} text-sm group-hover:text-blue-400 transition-colors truncate`}>{can.name}</h3>
            {can.cicloCerrado && (
              <Sparkles size={10} className="text-blue-400/50" />
            )}
          </div>
          <div className="flex items-center gap-2 text-[7px] font-black uppercase text-zinc-600 tracking-widest mt-0.5">
            <ShieldCheck size={8} className="text-emerald-500" />
            <span className="truncate">
                Finalizado · {can.fechaCierre ? new Date(can.fechaCierre).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Reciente'}
            </span>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-1 md:order-last">
          <button
            onClick={() => navigate(`/dashboard/chat/${can.id}`, { state: { candidato: can } })}
            className="p-2 text-zinc-800 hover:text-blue-500 transition-colors"
            title="Ir al Chat"
          >
            <MessageSquare size={16} />
          </button>
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(can.id);
              }}
              className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
              title="Archivar registro"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* SECCIÓN DE RATINGS (Upscaled & Interactive) */}
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-zinc-900/30 md:bg-transparent p-4 md:p-0 rounded-2xl mt-4 md:mt-0 border border-white/5 md:border-transparent">

          {/* Tu Voto (Interactivo) */}
          <div className="flex flex-col items-center md:items-end min-w-[120px] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tu Calificación</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={can.cicloCerrado || can.justSent}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof updateCandidato === 'function') {
                      updateCandidato(can.id, { rating: star });
                    }
                  }}
                  className={`transition-all ${!(can.cicloCerrado || can.justSent) ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                >
                  <Star
                    size={20}
                    className={star <= (can.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-zinc-800"} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-white/10" />

          {/* Calificación Recibida (Doble Ciego) */}
          <div className="flex flex-col items-center min-w-[100px] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recibido</span>

            {can.ratingsUnlocked ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                <span className="text-sm text-emerald-500 font-black">{can.ratingRecibido}.0</span>
                <Star size={14} className="text-emerald-500 fill-emerald-500" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-600 bg-white/5 px-3 py-1 rounded-xl border border-white/5">
                <Lock size={12} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Bloqueado</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ÁREA DE COMENTARIOS (Solo si no está sellado) */}
      {!can.cicloCerrado && !can.justSent && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="relative group">
            <textarea
              placeholder="Escribe un comentario público sobre el desempeño de este candidato..."
              value={can.comentarioPublico || ''}
              onChange={(e) => updateCandidato(can.id, { comentarioPublico: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-4 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all min-h-[100px] resize-none"
            />
          </div>
          
          <button
            onClick={() => onSeal(can.id, can.vacanteId)}
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
          >
            <ShieldCheck size={16} />
            Sellar Turno y Calificar
          </button>
        </div>
      )}

      {/* SUBTÍTULO EXPLICATIVO (Storytelling de Favoritos) */}
      {isFavorite && (
        <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
          <Heart size={14} className="text-purple-500 mt-0.5 fill-purple-500 shrink-0" />
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Has añadido a <span className="text-purple-400 font-bold">{can.name}</span> a tus Favoritos.
          </p>
        </div>
      )}

      {/* --- ESTADOS DE PROTOCOLO --- */}
      {can.justSent && (
        <div className="mt-4 p-4 bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
          <ShieldAlert size={18} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest leading-none">
            Calificación Encriptada y en proceso de sellado...
          </p>
        </div>
      )}

      {can.cicloCerrado && !can.justSent && (
        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-center gap-3">
          <CheckCircle2 size={16} className="text-blue-400" />
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">
            Contrato Finalizado y Calificado
          </p>
        </div>
      )}

    </div>
  );
};

export default CandidatoRow;