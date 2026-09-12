import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '../../../config/routes.paths';

const HeroActions = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full justify-center lg:justify-start">
      {/* Botón Principal y Enlace Secundario */}
      <div className="flex flex-col items-center sm:items-start gap-1.5 w-full sm:w-auto">
        <Link
          to={PATHS.PUBLIC.REGISTER_COMPANY}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#047857] to-[#0f766e] hover:from-[#065f46] hover:to-[#115e59] text-white font-semibold text-sm transition-all border border-emerald-400/30 shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-95 cursor-pointer w-full max-w-[250px] sm:w-auto text-center"
        >
          <span>Publicar un turno</span>
          <ArrowRight size={16} className="text-white stroke-[2.5]" />
        </Link>

        <Link
          to={PATHS.PUBLIC.REGISTER_TALENT}
          className="text-xs text-zinc-400 hover:text-white font-medium transition-colors flex items-center justify-center sm:justify-start gap-1 py-0.5 group"
        >
          <span>¿Buscas turnos? Regístrate como talento</span>
          <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </div>

      {/* Trazado de Vuelo SVG con Avión de Papel + Rating de Confianza */}
      <div className="flex items-center gap-2 select-none shrink-0">
        <div className="relative w-[85px] sm:w-[105px] h-[46px] shrink-0">
          <svg viewBox="0 0 110 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
            <path
              d="M 2 34 C 18 18, 38 6, 56 12 C 72 17, 76 34, 64 36 C 52 38, 50 20, 62 16 C 74 12, 86 24, 94 30"
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth="1.5"
              strokeDasharray="3.5 3.5"
              strokeLinecap="round"
            />
            <g transform="translate(86, 25) rotate(22)">
              <path d="M 22 0 L 0 -8 L 6 0 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M 22 0 L 0 8 L 6 0 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M 22 0 L 6 0 L 3 3.5 Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.95)" strokeWidth="1" strokeLinejoin="round"/>
            </g>
          </svg>
        </div>

        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">100%</span>
            <span className="text-zinc-600 font-light text-sm">|</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-sm leading-none">★</span>
              ))}
            </div>
          </div>
          <span className="text-[11px] sm:text-xs text-zinc-400 font-normal mt-1 leading-none">
            (Talento verificado con antecedentes)
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroActions;
