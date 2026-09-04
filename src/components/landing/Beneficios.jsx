import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase, Zap, Star, ShieldCheck, Clock } from 'lucide-react';

const Beneficios = () => {
  return (
    <section id="beneficios" className="py-24 md:py-32 bg-[#060d15] relative overflow-hidden border-t border-white/[0.06]">
      {/* 🌊 Formas Fluidas Iridiscentes de Fondo (Estilo referencia con azules, cian y esmeralda) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Glow Superior Izquierdo: Cian / Azul */}
        <div className="absolute -top-16 -left-16 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-transparent rounded-full blur-[110px]" />
        
        {/* Glow Central / Derecho: Esmeralda / Menta */}
        <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-gradient-to-bl from-emerald-400/25 via-teal-500/20 to-transparent rounded-full blur-[120px]" />
        
        {/* Glow Inferior: Azul Cobalto Profundo */}
        <div className="absolute -bottom-24 left-1/3 w-[600px] h-[400px] bg-gradient-to-t from-blue-700/25 via-indigo-600/15 to-transparent rounded-full blur-[130px]" />

        {/* 🎨 Elementos Gráficos Fluidos 3D Iridescentes (Simulando las cintas líquidas de la referencia) */}
        <svg className="absolute -top-10 -left-10 w-96 h-96 opacity-40 blur-[1px]" viewBox="0 0 200 200" fill="none">
          <path d="M40,100 C40,40 100,40 130,70 C160,100 170,160 110,170 C50,180 40,160 40,100 Z" stroke="url(#chroma1)" strokeWidth="6" strokeLinecap="round" />
          <defs>
            <linearGradient id="chroma1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute -bottom-16 -right-10 w-[420px] h-[420px] opacity-35 blur-[1px]" viewBox="0 0 200 200" fill="none">
          <path d="M160,100 C160,160 100,160 70,130 C40,100 30,40 90,30 C150,20 160,40 160,100 Z" stroke="url(#chroma2)" strokeWidth="7" strokeLinecap="round" />
          <defs>
            <linearGradient id="chroma2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Hecho para el ritmo real de la <br className="hidden sm:block" />
            gastronomía, eventos y servicios.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300/90 font-normal">
            Sea que necesites cubrir un turno urgente o quieras generar ingresos con turnos extras en tus días libres, Turnes es tu canal directo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">

          {/* CARD 1: PARA NEGOCIOS (Translúcido Cromático con Reflejo Líquido) */}
          <div className="rounded-[2.5rem] p-8 md:p-10 border border-white/20 bg-white/[0.05] backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:border-white/35 transition-all duration-500">
            {/* Difusión Cromática Interna (Verde/Cian en esquina superior y Azul en esquina inferior como la referencia) */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/25 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-cyan-200 text-xs font-bold uppercase tracking-wider mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <Briefcase size={14} className="text-cyan-300" />
                Para Restaurantes, Bares y Eventos
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                Cubre bajas de último minuto sin frenar tus ventas.
              </h3>
              <p className="text-sm text-zinc-300/90 mb-8 leading-relaxed">
                Cuando un mesero, bartender o cocinero te cancela a última hora, la operación se resiente. En Turnes encuentras refuerzos calificados listos para hoy.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-cyan-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <Zap size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">Turnos cubiertos en horas:</strong> Publica tu turno y recibe candidatos disponibles en tu zona en minutos.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-cyan-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <ShieldCheck size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">Cero nómina fija para refuerzos:</strong> Pagas únicamente por el turno trabajado sin ataduras salariales permanentes.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-cyan-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <Star size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">Calificaciones verificadas:</strong> Conoce la reputación y puntualidad del talento antes de confirmar su asistencia.
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center gap-3">
              <Link 
                to="/register/empresa" 
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/25 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] text-center"
              >
                PUBLICAR UN TURNO AHORA
              </Link>
              <Link 
                to="/precios" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-transparent hover:bg-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs transition-all text-center border border-white/15 backdrop-blur-md"
              >
                Ver Tarifas
              </Link>
            </div>
          </div>

          {/* CARD 2: PARA TALENTO (Translúcido Cromático con Reflejo Líquido) */}
          <div className="rounded-[2.5rem] p-8 md:p-10 border border-white/20 bg-white/[0.05] backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:border-white/35 transition-all duration-500">
            {/* Difusión Cromática Interna (Esmeralda en esquina superior y Azul Cobalto en esquina inferior como la referencia) */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-400/25 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-600/25 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <CheckCircle size={14} className="text-emerald-300" />
                Para Estudiantes, Colaboradores y Extras
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                Tú eliges cuándo trabajar. Día trabajado, día pagado.
              </h3>
              <p className="text-sm text-zinc-300/90 mb-8 leading-relaxed">
                Toma turnos extras en tus días libres o trabaja a tu propio ritmo en los restaurantes, eventos y cafeterías de Bucaramanga y Santander.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-emerald-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <Clock size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">Turnos en tu zona:</strong> Ofertas claras con horarios, lugar exacto y tarifa estipulada desde el inicio.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-emerald-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <ShieldCheck size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">100% Gratis para ti (0% comisión):</strong> Turnes nunca descuenta de tu sueldo. La empresa te paga el 100% acordado directamente al finalizar (Efectivo, Nequi o DaviPlata).
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/[0.08] border border-white/15 text-emerald-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <Star size={15} />
                  </div>
                  <span className="text-zinc-200 text-sm font-medium">
                    <strong className="text-white">Construye tu reputación:</strong> Cada turno calificado con 5 estrellas te posiciona para mejores tarifas y llamados directos.
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center gap-3">
              <Link 
                to="/explorar" 
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)] text-center"
              >
                VER TURNOS DISPONIBLES
              </Link>
              <Link 
                to="/register/talento" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-transparent hover:bg-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs transition-all text-center border border-white/15 backdrop-blur-md"
              >
                Regístrate Gratis
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Beneficios;
