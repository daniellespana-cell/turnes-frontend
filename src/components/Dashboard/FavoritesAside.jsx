import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FavoritesAside = () => {
  const navigate = useNavigate();
  const avatars = [1, 2, 3, 4];

  return (
    <section className="bg-zinc-900/10 border border-white/5 p-5 rounded-2xl relative overflow-hidden transition-all duration-500 hover:bg-zinc-900/20 group">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 antialiased">
          <Heart size={10} className="text-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" />
          Favoritos
        </h3>
        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">12</span>
      </div>

      <div className="mb-5">
        <p className="text-[10px] leading-relaxed text-zinc-500 font-medium tracking-wide max-w-[220px]">
          Recontratación rápida <span className="text-zinc-400">sin filtros</span>.
        </p>
      </div>

      <div className="flex -space-x-2.5 mb-6 pl-1">
        {avatars.map(i => (
          <img
            key={i}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Staff${i}`}
            className="w-8 h-8 rounded-full border border-black/50 bg-zinc-800 transition-transform group-hover:-translate-y-0.5"
            alt="Favorito"
          />
        ))}
        <div className="w-8 h-8 rounded-full border border-black/50 bg-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-500">
          +8
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard/favoritos')}
        className="w-full py-3 bg-zinc-900 border border-white/5 hover:border-purple-500/30 hover:bg-zinc-800 text-zinc-400 hover:text-purple-300 rounded-xl text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all relative overflow-hidden"
      >
        <span className="relative z-10">Recontratar</span>
      </button>
    </section>
  );
};