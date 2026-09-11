import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../config/routes.paths';

const BlogCTA = () => {
  return (
    <section className="py-20 border-t border-zinc-800/80 bg-[#07090c] text-center" aria-label="Llamado a la acción del Blog">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          ¿Listo para transformar la gestión de turnos de tu negocio?
        </h3>
        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Únete a la plataforma que conecta la urgencia operativa de restaurantes y bares con personal calificado en tiempo récord.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={PATHS.PUBLIC.REGISTER_COMPANY}
            className="px-8 py-4 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm uppercase tracking-wider transition-all border border-emerald-600/30 shadow-md"
          >
            Publicar Turno Urgente
          </Link>
          <Link
            to={PATHS.PUBLIC.REGISTER_TALENT}
            className="px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider transition-all border border-zinc-700/80"
          >
            Quiero Trabajar (0% Comisión)
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogCTA;
