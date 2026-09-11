import React from 'react';
import { BookOpen } from 'lucide-react';

const BlogHero = () => {
  return (
    <section className="pt-12 pb-14 sm:pb-18 border-b border-zinc-800/80 relative text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-5">
          <BookOpen size={16} />
          <span>Centro Editorial & Recursos</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.14] max-w-4xl mx-auto">
          El Blog del Trabajo Operativo y Turnos en Colombia
        </h1>

        <p className="text-base sm:text-xl text-zinc-300 mt-4 max-w-2xl mx-auto leading-relaxed font-normal">
          Estrategias para cubrir turnos urgentes en restaurantes y bares sin sobrecostos de nómina, y guías para profesionales que quieren cobrar el mismo día con 0% comisión.
        </p>
      </div>
    </section>
  );
};

export default BlogHero;
