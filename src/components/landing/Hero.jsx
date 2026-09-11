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
      role="banner"
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

      {/* 2. CONTENEDOR PRINCIPAL: COMPOSICIÓN RESPONSIVA Y ARMÓNICA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14 lg:py-16 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-8 lg:gap-12 items-center">

          {/* COLUMNA PRINCIPAL / TEXTO: Centrado en móvil, alineado a la izquierda en desktop */}
          <div className="md:col-span-7 text-center md:text-left flex flex-col items-center md:items-start space-y-4 sm:space-y-5 md:space-y-6">

            {/* Kicker Enterprise con indicador sobrio */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#064e3b]/35 border border-[#047857]/40 backdrop-blur-md self-center md:self-start">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-200/90 text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
                Marketplace de Turnos Operativos
              </span>
            </div>

            {/* Titular Formal y Nítido: Impactante en móvil y expansivo en desktop */}
            <h1
              id="hero-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.18] sm:leading-[1.14] md:leading-[1.1] max-w-xl md:max-w-none"
            >
              La app que cubre tus turnos{' '}
              <span className="block sm:inline mt-1 sm:mt-0">
                en{' '}
                <span 
                  className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-[#047857] text-white border border-[#059669]/40 shadow-sm align-baseline whitespace-nowrap"
                  style={{ textShadow: 'none' }}
                >
                  tiempo récord.
                </span>
              </span>
            </h1>

            {/* Párrafo Formal y Claro */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed max-w-lg md:max-w-xl">
              Conecta con personas disponibles y verificadas cerca de ti.<br className="hidden sm:block" />
              Sin burocracia. Sin bolsa de empleo.
            </p>

            {/* Botón Principal y Enlace Secundario (Centrado en móvil, ergonómico) */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                to={PATHS.PUBLIC.REGISTER_COMPANY}
                className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm sm:text-base transition-all border border-[#059669]/40 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer w-full sm:w-auto text-center"
              >
                <span>Publicar un turno</span>
                <ArrowRight size={18} className="text-white stroke-[2.5]" />
              </Link>

              <Link
                to={PATHS.PUBLIC.REGISTER_TALENT}
                className="text-xs sm:text-sm text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center gap-1.5 py-1 group text-center"
              >
                <span>¿Buscas turnos? Regístrate como talento</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Indicadores de Confianza para Desktop / Tablet (Dentro de columna izquierda) */}
            <div className="hidden md:flex pt-5 lg:pt-6 border-t border-zinc-800/80 flex-wrap items-center gap-5 lg:gap-6 text-xs lg:text-sm text-slate-300 w-full">
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

          {/* COLUMNA VISUAL: MOCKUP FOTOGRÁFICO DE IPHONE 16 PRO CON MICRO-BADGES FLOTANTES */}
          <div className="md:col-span-5 flex flex-col items-center justify-center md:justify-end relative py-2 md:py-0 mt-2 sm:mt-4 md:mt-0 w-full">
            {/* Resplandor ambiental sobrio y mate detrás del iPhone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] md:w-[360px] lg:w-[400px] h-[320px] sm:h-[400px] md:h-[460px] bg-[#064e3b]/25 blur-[90px] sm:blur-[110px] rounded-full pointer-events-none" />

            {/* Contenedor del Mockup con Levitación Suave y Micro-Badges */}
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
              className="relative w-full max-w-[210px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[390px] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] cursor-pointer select-none"
              title="Haz clic para publicar un turno"
            >
              {/* Micro-Badge Flotante Superior: Calificación y Confianza */}
              <div className="absolute -top-2.5 sm:-top-3 -right-2 sm:-right-4 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#06090e]/95 border border-emerald-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight">★ 4.9 · Verificado</span>
              </div>

              {/* Imagen del iPhone Mockup */}
              <img
                src={heroPhoneMockup}
                alt="Mockup iPhone 16 Pro con la App Turnes"
                className="w-full h-auto object-contain pointer-events-none"
                width="896"
                height="1200"
                loading="eager"
              />

              {/* Micro-Badge Flotante Inferior: Tiempo de Cobertura */}
              <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-4 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#06090e]/95 border border-zinc-700/80 shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                <span className="text-emerald-400 font-bold text-xs">⚡</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 tracking-tight">Turno cubierto hoy</span>
              </div>
            </motion.div>

            {/* Indicadores de Confianza en Móvil (Ubicados armónicamente al pie de la composición visual) */}
            <div className="md:hidden w-full pt-5 mt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 text-xs text-slate-300">
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

        </div>
      </div>
    </motion.section>
  );
};

export default Hero;