import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Star, Lock, MessageSquare,
  ShieldAlert, Sparkles, CheckCircle2, Heart
} from 'lucide-react';
import { typography } from '../../styles/typography';

const CandidatoRow = ({ can }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(can.isFavorite || false);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    const data = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
    const updatedData = data.map(item => {
      if (item.id === can.id) {
        return { ...item, isFavorite: newFavoriteStatus };
      }
      return item;
    });

    localStorage.setItem('turnes_validados', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div key={can.id} className="flex flex-col bg-[#050505] border border-white/5 rounded-2xl p-3 md:p-4 group animate-in slide-in-from-right-2 hover:border-white/10 transition-all overflow-hidden relative">

      {/* CONTENIDO PRINCIPAL DE LA FILA */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 relative z-10">

        {/* AVATAR + CORAZÓN INTEGRADO */}
        <div className="relative shrink-0 group/avatar">
          <img src={can.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover grayscale opacity-60 group-hover:opacity-100 transition-all border border-white/5" alt="" />
          <button
            onClick={toggleFavorite}
            className={`absolute -top-2 -left-2 p-1.5 rounded-full border transition-all duration-300 shadow-xl ${isFavorite
                ? "bg-purple-600 border-purple-400 scale-110"
                : "bg-zinc-900 border-white/10 group-hover/avatar:border-purple-500/50"
              }`}
          >
            <Heart
              size={12}
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
            <span className="truncate">Finalizado · {new Date(can.fechaCierre).toLocaleDateString()}</span>
          </div>
        </div>

        {/* BOTÓN CHAT (En móvil se queda arriba a la derecha) */}
        <button
          onClick={() => navigate(`/dashboard/chat/${can.id}`, { state: { candidato: can } })}
          className="p-2 text-zinc-800 hover:text-blue-500 transition-colors md:order-last"
        >
          <MessageSquare size={16} />
        </button>

        {/* SECCIÓN DE RATINGS (En móvil baja a nueva línea y ocupa todo el ancho) */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 md:gap-6 bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none mt-1 md:mt-0 border border-white/5 md:border-0">

          {/* Tu Voto */}
          <div className="flex flex-col items-start md:items-end">
            <span className={typography.sectionTitle}>Tu Voto</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={8}
                  className={i < can.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-800"} // 🟡 Cambio a Amarillo
                />
              ))}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/10 md:bg-white/5" />

          {/* Calificación Recibida */}
          <div className="flex flex-col items-end md:items-center min-w-[70px] md:min-w-[90px] relative">
            <span className={typography.sectionTitle}>Recibido</span>

            {can.trabajadorYaCalifico ? (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20 scale-100 md:scale-110">
                <span className={`${typography.data} text-[10px] text-yellow-400 font-black`}>{can.ratingRecibido}.0</span>
                <Star size={8} className="text-yellow-400 fill-yellow-400" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-800">
                <Lock size={10} />
                <span className={typography.meta}>Oculto</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SUBTÍTULO EXPLICATIVO (Storytelling de Favoritos) */}
      {isFavorite && (
        <div className="mt-3 mx-0 md:mx-1 flex items-start gap-3 px-3 py-2.5 bg-purple-500/5 border border-purple-500/10 rounded-xl animate-in fade-in slide-in-from-top-1">
          <Heart size={10} className="text-purple-500 mt-0.5 fill-purple-500 shrink-0" />
          <p className="text-[9px] leading-relaxed text-zinc-400 font-medium tracking-tight">
            Has añadido a <span className="text-purple-400 font-bold">{can.name}</span> a tus Favoritos.
          </p>
        </div>
      )}

      {/* --- ESTADOS DE PROTOCOLO --- */}
      {can.justSent && (
        <div className="mt-3 mx-0 md:mx-2 p-2.5 bg-amber-500/[0.03] border border-amber-500/20 rounded-xl flex items-center gap-3 animate-pulse">
          <ShieldAlert size={12} className="text-amber-500 shrink-0" />
          <p className="text-[7.5px] text-amber-500/80 font-black uppercase tracking-widest leading-none">
            Calificación Encriptada.
          </p>
        </div>
      )}

      {can.cicloCerrado && !can.justSent && (
        <div className="mt-3 mx-0 md:mx-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-center gap-2">
          <CheckCircle2 size={10} className="text-blue-400" />
          <p className="text-[7px] text-blue-400 font-black uppercase tracking-[0.2em]">
            Ciclo Cerrado
          </p>
        </div>
      )}

    </div>
  );
};

export default CandidatoRow;