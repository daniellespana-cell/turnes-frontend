import React from 'react';
import { m as motion } from 'framer-motion';
import HeroSearch from './HeroSearch';

// Imported

// 🟢 LCP Optimization: Imagen servida desde /public para permitir <link rel="preload">
const heroBackgroundImage = '/mi-foto-hero.webp';

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const Hero = () => {
  return (
    <motion.section
      className="py-20 md:py-28 bg-zinc-950 text-main overflow-hidden relative"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      role="banner"
      aria-labelledby="hero-heading"
    >

      {/* 1. IMAGEN DE FONDO (ALTA NITIDEZ) - LCP OPTIMIZED */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={heroBackgroundImage}
          alt="Fondo Hero"
          className="w-full h-full object-cover object-center"
          width="1920"
          height="1080"
          fetchPriority="high"
          loading="eager"
        />
        {/* Capa de Oscurecimiento: Fondo negro (70%) para asegurar el contraste de lectura */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge "Marketplace de Turnos" */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6 hover:bg-white/10 transition-colors cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300 tracking-wider uppercase text-[10px]">Marketplace de Turnos Extras y Operativos · Colombia</span>
          </div>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.18] text-white mb-5"
          >
            La app que cubre tus turnos en<br />
            tiempo récord.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 my-6 max-w-xl mx-auto leading-relaxed font-normal">
            Conecta con personas disponibles y verificadas cerca de ti.<br className="hidden md:block" /> Sin burocracia. Sin bolsa de empleo.
          </p>


          {/* 3. HERO SEARCH (Platzi-Style) */}
          <HeroSearch />

          {/* 4. SOCIAL PROOF (Trust Badge) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4"
          >
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Confiado por negocios en Bucaramanga, Girón y el país
            </p>
            <div className="flex -space-x-3 opacity-80 hover:opacity-100 transition-opacity">
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=H&background=0D8ABC&color=fff" alt="Company 1" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=R&background=FFB347&color=fff" alt="Company 2" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=C&background=FF69B4&color=fff" alt="Company 3" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=T&background=10b981&color=fff" alt="Company 4" />
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                +46
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section >
  );
};

export default Hero;