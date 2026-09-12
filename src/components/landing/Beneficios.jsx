import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

const Beneficios = () => {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-black relative border-t border-zinc-800/80" aria-labelledby="beneficios-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        
        {/* Encabezado Limpio */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Gastronomía, Eventos y Servicios</span>
          </div>
          <h2 id="beneficios-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Hecho para el ritmo real del sector.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 max-w-xl mx-auto font-normal leading-relaxed">
            Sea que necesites cubrir un turno urgente o quieras generar ingresos con turnos extras en tus días libres, Turnes es tu canal directo.
          </p>
        </div>

        {/* Grid de 2 Tarjetas Limpias (Cero anidaciones, optimizado para móvil) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

          {/* TARJETA 1: PARA RESTAURANTES, BARES Y EVENTOS */}
          <div className="bg-[#090b0e] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-colors shadow-lg">
            <div>
              <div className="mb-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Para Restaurantes, Bares y Eventos
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
                Cubre bajas de último minuto sin frenar tus ventas.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                Cuando un mesero, bartender o cocinero te cancela a última hora, la operación se resiente. En Turnes encuentras refuerzos calificados listos para hoy.
              </p>

              {/* Lista Tipográfica Limpia con Marcador Sólido */}
              <div className="space-y-3.5 mb-8 pt-4 border-t border-zinc-800/70">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">Turnos cubiertos en horas:</strong> Publica tu turno y recibe candidatos disponibles en tu zona en minutos.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">Cero nómina fija para refuerzos:</strong> Pagas únicamente por el turno trabajado sin ataduras salariales permanentes.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">Calificaciones verificadas:</strong> Conoce la reputación y puntualidad del talento antes de confirmar su asistencia.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <Link
                to={PATHS.PUBLIC.REGISTER_COMPANY}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs uppercase tracking-wider transition-all border border-emerald-600/30 text-center shadow-sm"
              >
                <span>Publicar un turno ahora</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to={PATHS.PUBLIC.PRICING}
                className="text-xs text-zinc-400 hover:text-white font-semibold text-center sm:text-right py-1 transition-colors"
              >
                Ver Tarifas &rarr;
              </Link>
            </div>
          </div>

          {/* TARJETA 2: PARA ESTUDIANTES, COLABORADORES Y EXTRAS */}
          <div className="bg-[#090b0e] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-colors shadow-lg">
            <div>
              <div className="mb-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Para Estudiantes, Colaboradores y Extras
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
                Tú eliges cuándo trabajar. Día trabajado, día pagado.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                Toma turnos extras en tus días libres o trabaja a tu propio ritmo en los restaurantes, eventos y cafeterías de Bucaramanga y Santander.
              </p>

              {/* Lista Tipográfica Limpia con Marcador Sólido */}
              <div className="space-y-3.5 mb-8 pt-4 border-t border-zinc-800/70">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">Turnos en tu zona:</strong> Ofertas claras con horarios, lugar exacto y tarifa estipulada desde el inicio.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">100% Gratis para ti (0% comisión):</strong> Turnes nunca descuenta de tu sueldo. La empresa te paga directamente al finalizar (Efectivo, Nequi o DaviPlata).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <strong className="text-white font-semibold">Construye tu reputación:</strong> Cada turno con 5 estrellas te posiciona para mejores tarifas y llamados directos.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <Link
                to={PATHS.PUBLIC.REGISTER_TALENT}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-zinc-700/80 text-center shadow-sm"
              >
                <span>Registrarme como Talento</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to={PATHS.PUBLIC.REGISTER_COMPANY}
                className="text-xs text-zinc-400 hover:text-white font-semibold text-center sm:text-right py-1 transition-colors"
              >
                Publicar un turno &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Beneficios;

