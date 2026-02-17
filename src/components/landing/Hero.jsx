import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import HeroSearch from './HeroSearch'; // Imported

// 🟢 Importamos la imagen desde la ruta relativa correcta
import heroBackgroundImage from '../../assets/mi-foto-hero.png';

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: "easeOut" } }
};

const wordContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const wordAnimation = {
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
    delay: 1.5
  }
};

const Hero = () => {

  const heroText = "Empleos por turnos y fijos, al instante.";
  const words = heroText.split(" ");

  return (
    <motion.section
      className="py-32 md:py-48 bg-zinc-950 text-main overflow-hidden relative"
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
          fetchPriority="high" // ⚡ Senior Dev Move: Prioritize LCP
          loading="eager"
        />
        {/* Capa de Oscurecimiento: Fondo negro (70%) para asegurar el contraste de lectura. */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">

          {/* Badge "Nueva Era" (Micro-Interaction) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-zinc-300 tracking-wide uppercase text-[10px]">La nueva era del trabajo</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-white mb-8 drop-shadow-2xl"
            variants={wordContainer}
            initial="hidden"
            animate="visible"
          >
            EL FUTURO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              ES AHORA
            </span>
          </motion.h1>

          <p className="text-xl md:text-2xl text-zinc-300 my-10 max-w-3xl mx-auto leading-relaxed font-light">
            Conectamos talento verificado con empresas líderes en tiempo récord.<br className="hidden md:block" /> Sin fricción. Sin esperas.
          </p>


          {/* 3. HERO SEARCH (Platzi-Style) */}
          <HeroSearch />

        </div>
      </div>
    </motion.section >
  );
};

export default Hero;