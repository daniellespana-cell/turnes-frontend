import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

const heroBackgroundImage = '/hero-bg-kitchen.jpg';
const heroPhoneMockup = '/iphone-turnes-hero.webp';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Hero = () => {
  const navigate = useNavigate();

  const handlePublishClick = () => {
    navigate(PATHS.PUBLIC.REGISTER_COMPANY);
  };

  return (
    <motion.section
      className="relative min-h-[640px] lg:min-h-[740px] flex items-center justify-center overflow-hidden border-b border-zinc-800/80 bg-[#06090e]"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      aria-labelledby="hero-heading"
    >
      {/* 1. FOTOGRAFÍA REAL DEL HERO (Ambiente Gourmet & Bar en Alta Resolución) */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <img
          src={heroBackgroundImage}
          alt="Personal de cocina gourmet y servicio en restaurante"
          className="w-full h-full object-cover object-center brightness-100 contrast-[1.02]"
          width="1920"
          height="1080"
          fetchPriority="high"
          loading="eager"
        />
        {/* Capa de contraste optimizada para móvil y escritorio */}
        <div className="absolute inset-0 bg-[#06090e]/85 sm:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090e]/95 via-[#06090e]/85 to-[#06090e]/40 sm:to-[#06090e]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06090e]/70 via-transparent to-[#06090e]/90" />
      </div>

      {/* 2. CONTENEDOR PRINCIPAL: ESPACIADO GENEROSO Y COMPOSICIÓN ARMÓNICA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* COLUMNA IZQUIERDA (Desktop: 7 cols / Móvil: centrado y armónico) */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start space-y-4 sm:space-y-5 lg:space-y-6">

            {/* Kicker Enterprise con indicador sobrio */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#064e3b]/35 border border-[#047857]/40 backdrop-blur-md">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-300/90 text-xs font-semibold tracking-wider uppercase">
                Marketplace de Turnos Operativos
              </span>
            </div>

            {/* Titular H1 Semántico, Sutil y de Alto Nivel (Plus Jakarta Sans) */}
            <h1
              id="hero-heading"
              className="font-sans text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.2] lg:leading-[1.14] max-w-xl lg:max-w-none text-balance"
            >
              La app que cubre tus turnos{' '}
              <span className="block sm:inline text-emerald-400 font-semibold">
                en tiempo récord.
              </span>
            </h1>

            {/* Párrafo Sutil y Ergonómico */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-normal leading-relaxed max-w-md lg:max-w-xl text-balance">
              Conecta con personas disponibles y verificadas cerca de ti. Sin burocracia ni bolsas de empleo.
            </p>

            {/* Botón Principal y Enlace Secundario (Alineación y dimensiones estándar) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 w-full">
              <Link
                to={PATHS.PUBLIC.REGISTER_COMPANY}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#047857] hover:bg-[#065f46] text-white font-semibold text-sm transition-all border border-[#059669]/40 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-95 cursor-pointer w-full max-w-[250px] sm:w-auto text-center"
              >
                <span>Publicar un turno</span>
                <ArrowRight size={16} className="text-white stroke-[2.5]" />
              </Link>

              <Link
                to={PATHS.PUBLIC.REGISTER_TALENT}
                className="text-xs sm:text-sm text-zinc-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-1.5 py-1.5 group text-center"
              >
                <span>¿Buscas turnos? Regístrate como talento</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Indicadores de Confianza para Desktop */}
            <div className="hidden lg:flex pt-6 border-t border-zinc-800/80 flex-wrap items-center gap-6 text-xs sm:text-sm text-zinc-400 w-full">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="font-medium">Sin burocracia</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="font-medium">Cero suscripciones fijas</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="font-medium">Pago al finalizar el turno</span>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA (Desktop: 5 cols / Móvil: Mockup limpio en el eje visual) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:justify-end relative py-2 lg:py-0 w-full">
            {/* Resplandor ambiental sobrio y mate detrás del iPhone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[340px] lg:w-[400px] h-[320px] sm:h-[420px] lg:h-[460px] bg-[#064e3b]/25 blur-[80px] lg:blur-[110px] rounded-full pointer-events-none" />

            {/* Contenedor del Mockup con Levitación Suave y Orgánica */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-0.5, 0.5, -0.5],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              onClick={handlePublishClick}
              className="relative w-full max-w-[220px] sm:max-w-[270px] lg:max-w-[380px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] cursor-pointer select-none"
              title="Haz clic para publicar un turno"
            >
              <img
                src={heroPhoneMockup}
                alt="Mockup iPhone 16 Pro con la App Turnes"
                className="w-full h-auto object-contain pointer-events-none"
                width="896"
                height="1200"
                loading="eager"
              />
            </motion.div>

            {/* Indicadores de Confianza en Móvil */}
            <div className="lg:hidden w-full pt-4 mt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={10} className="stroke-[3]" />
                </div>
                <span className="font-medium">Sin burocracia</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={10} className="stroke-[3]" />
                </div>
                <span className="font-medium">Cero suscripciones fijas</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#064e3b]/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Check size={10} className="stroke-[3]" />
                </div>
                <span className="font-medium">Pago al finalizar el turno</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default Hero;