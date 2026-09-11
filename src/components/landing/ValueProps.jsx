import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { PATHS } from '../../config/routes.paths';

// Datos de habilidades (4 roles distribuidos en pares diagonales X)
const SKILL_PAIRS = [
  {
    id: 'pair-1',
    // Diagonal 1: Superior Derecha & Inferior Izquierda
    items: [
      {
        title: 'Camareros / Meseros',
        rate: '$50k – $75k / turno',
        position: 'top-3 sm:top-4 right-2 sm:right-5',
      },
      {
        title: 'Bartender',
        rate: '$70k – $95k / turno',
        position: 'bottom-4 sm:bottom-5 left-2 sm:left-5',
      }
    ]
  },
  {
    id: 'pair-2',
    // Diagonal 2: Superior Izquierda & Inferior Derecha (formando la X)
    items: [
      {
        title: 'Parrillero / Asador',
        rate: '$75k – $110k / turno',
        position: 'top-3 sm:top-4 left-2 sm:left-5',
      },
      {
        title: 'Barista Experto',
        rate: '$60k – $85k / turno',
        position: 'bottom-4 sm:bottom-5 right-2 sm:right-5',
      }
    ]
  }
];

// Perfiles de talento verificado en Colombia
const TALENT_PROFILES = [
  {
    id: 'laura',
    name: 'Laura M.',
    avatar: '/avatar-talento.jpg',
    role: 'Camarera & Barista',
    experience: '3 años de experiencia',
    status: '● En línea hoy',
    rating: '★ 4.9 (42 turnos)',
    city: 'Bucaramanga'
  },
  {
    id: 'carlos',
    name: 'Carlos R.',
    avatar: '/avatar-carlos.jpg',
    role: 'Parrillero & Cocinero',
    experience: '5 años de experiencia',
    status: '● Disponible hoy',
    rating: '★ 5.0 (68 turnos)',
    city: 'Floridablanca'
  },
  {
    id: 'valentina',
    name: 'Valentina S.',
    avatar: '/avatar-valentina.jpg',
    role: 'Bartender & Mixóloga',
    experience: '4 años de experiencia',
    status: '● En línea hoy',
    rating: '★ 4.9 (35 turnos)',
    city: 'Girón'
  }
];

const ValueProps = () => {
  const [activePairIndex, setActivePairIndex] = useState(0);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);

  // Rotación automática de habilidades en X (Diagonal A -> Diagonal B)
  useEffect(() => {
    const skillsTimer = setInterval(() => {
      setActivePairIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3800);
    return () => clearInterval(skillsTimer);
  }, []);

  // Rotación automática de perfiles de talento (Laura -> Carlos -> Valentina)
  useEffect(() => {
    const profileTimer = setInterval(() => {
      setActiveProfileIndex((prev) => (prev + 1) % TALENT_PROFILES.length);
    }, 4200);
    return () => clearInterval(profileTimer);
  }, []);

  const currentPair = SKILL_PAIRS[activePairIndex];
  const currentProfile = TALENT_PROFILES[activeProfileIndex];

  return (
    <section className="py-20 md:py-28 bg-black relative overflow-hidden border-t border-zinc-800/80" aria-labelledby="value-heading">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#047857]/10 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#064e3b]/35 border border-[#047857]/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
            <span>Para Microempresarios y Emprendedores de Colombia</span>
          </div>
          <h2 id="value-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            El personal extra que necesitas, <br className="hidden sm:block" />
            justo cuando lo necesitas.
          </h2>
          <p className="text-base sm:text-lg text-slate-300/80 mt-3 max-w-xl mx-auto font-normal">
            Conectamos la urgencia de tu negocio con personas verificadas listas para trabajar hoy.
          </p>
        </div>

        {/* Bloque de Dos Columnas Operativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 sm:mb-16">

          {/* COLUMNA 1: TALENTO INDEPENDIENTE */}
          <div className="bg-[#0b0e14] text-white rounded-[2.5rem] p-7 sm:p-10 shadow-2xl border border-zinc-800/80 flex flex-col justify-between group hover:border-zinc-700 transition-all duration-300">
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider block">
                  Para ganar dinero
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-1 leading-[1.08]">
                  Encuentra <br />Trabajo
                </h3>
              </div>

              <Link
                to={PATHS.PUBLIC.REGISTER_TALENT}
                aria-label="Encuentra trabajo en Turnes"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-300 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-sm shrink-0"
              >
                <ArrowRight size={22} className="stroke-[2.5] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Cápsula Visual con Habilidades en Rotación Diagonal (X) */}
            <div className="h-[250px] sm:h-[280px] rounded-[2rem] bg-gradient-to-br from-[#121824] via-[#090d14] to-[#05070a] border border-zinc-800/70 relative overflow-hidden flex items-center justify-center p-6 shadow-inner select-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#047857]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPair.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="w-full h-full relative"
                  >
                    {currentPair.items.map((item, idx) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: idx === 0 ? -12 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className={`absolute ${item.position} bg-[#161c28]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-700/60 flex flex-col`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span>🪙</span> {item.rate}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Marcadores fijos de territorio */}
                <div className="absolute bottom-16 right-10 flex items-center gap-1.5 bg-black/80 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] text-zinc-300 font-medium pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Bucaramanga</span>
                </div>
                <div className="absolute top-12 left-6 flex items-center gap-1.5 bg-black/40 border border-zinc-800/80 px-2.5 py-1 rounded-full text-[10px] text-zinc-300 font-medium pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Área Metro</span>
                </div>
              </div>

              {/* Indicador de alternancia de habilidades */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {SKILL_PAIRS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activePairIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

            </div>

          </div>

          {/* COLUMNA 2: EMPRESAS Y NEGOCIOS */}
          <div className="bg-[#0b0e14] text-white rounded-[2.5rem] p-7 sm:p-10 shadow-2xl border border-zinc-800/80 flex flex-col justify-between group hover:border-zinc-700 transition-all duration-300">
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider block">
                  Para tu empresa
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-1 leading-[1.08]">
                  Contrata <br />Personal
                </h3>
              </div>

              <Link
                to={PATHS.PUBLIC.REGISTER_COMPANY}
                aria-label="Contrata personal para tu empresa en Turnes"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-300 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-sm shrink-0"
              >
                <ArrowRight size={22} className="stroke-[2.5] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Cápsula Visual con Perfiles en Rotación Animada */}
            <div className="h-[250px] sm:h-[280px] rounded-[2rem] bg-gradient-to-br from-[#121824] via-[#090d14] to-[#05070a] border border-zinc-800/70 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 shadow-inner select-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#047857]/15 rounded-full blur-2xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProfile.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="bg-[#161c28]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-zinc-700/60 w-full max-w-[215px] text-center relative z-10"
                >
                  <div className="relative w-14 h-14 mx-auto mb-2">
                    <img 
                      src={currentProfile.avatar} 
                      alt={`${currentProfile.name} - Talento Verificado Turnes`} 
                      className="w-full h-full object-cover rounded-full border-2 border-[#047857] shadow-md"
                      width="56"
                      height="56"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#161c28] rounded-full" />
                  </div>

                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {currentProfile.name}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-400">
                      {currentProfile.rating.split(' ')[0]}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-400 block mt-0.5">
                    {currentProfile.status}
                  </span>
                  
                  <p className="text-[10px] text-zinc-300 mt-1 leading-snug font-medium">
                    {currentProfile.role}
                  </p>
                  <p className="text-[9px] text-zinc-400">
                    {currentProfile.experience} · {currentProfile.city}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800">
                    <span className="inline-block w-full py-1 px-3 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-xs font-bold rounded-xl transition-colors">
                      Chatea
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicador de carrusel de perfiles (3 dots) */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {TALENT_PROFILES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeProfileIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* Barra de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-[#0b0e14] border border-zinc-800/80">
          <div className="text-center border-r border-zinc-800/80 pr-2">
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">&lt; 2 Horas</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Respuesta para turnos urgentes</p>
          </div>
          <div className="text-center lg:border-r border-zinc-800/80 px-2">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Cédula y antecedentes validados</p>
          </div>
          <div className="text-center border-r border-zinc-800/80 px-2">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">0% Comisión</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">100% gratis para trabajadores</p>
          </div>
          <div className="text-center pl-2">
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">Santander</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Bga, Girón, Florida, Piedecuesta</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValueProps;

