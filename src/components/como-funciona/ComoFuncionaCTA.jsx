import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

/**
 * ComoFuncionaCTA
 * Bloque final de llamada a la acción para conversión de empresas
 */
const ComoFuncionaCTA = () => {
  return (
    <section className="text-center bg-white border border-zinc-200/90 rounded-[2.5rem] p-7 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-zinc-900">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-3">
        Cubre tu próximo turno en tiempo récord
      </h2>
      <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto mb-8 leading-relaxed">
        No dejes que una ausencia inesperada paralice tu negocio. Regístrate gratis en menos de 1 minuto y publica tu primera oferta.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={PATHS.PUBLIC.REGISTER_COMPANY}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
        >
          <span>Registrar mi Empresa Gratis</span>
          <ArrowRight size={16} />
        </Link>
        <Link
          to={PATHS.PUBLIC.PRICING}
          className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-wider transition-all border border-zinc-300"
        >
          Ver Tarifas y Planes
        </Link>
      </div>

      <p className="text-xs text-zinc-500 mt-4">
        0 cargos fijos • Tu primer turno temporal es 100% libre de comisión
      </p>
    </section>
  );
};

export default ComoFuncionaCTA;
