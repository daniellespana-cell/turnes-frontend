import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { PATHS } from '../../config/routes.paths';
import HeroBackground from './hero/HeroBackground';
import HeroHeader from './hero/HeroHeader';
import HeroActions from './hero/HeroActions';
import HeroKPIs from './hero/HeroKPIs';
import HeroMockup from './hero/HeroMockup';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

/**
 * Componente Principal Hero.
 * Orquestador modular, limpio y semántico de la sección Hero de Turnes.
 */
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
      {/* 1. Fotografía de fondo y gradientes de contraste */}
      <HeroBackground />

      {/* 2. Contenedor principal: Composición de 12 columnas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Columna Izquierda: Textos, CTA, Rating y KPIs (Desktop) */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start space-y-4 sm:space-y-5 lg:space-y-6">
            <HeroHeader />

            <div className="pt-2 flex flex-col items-center lg:items-start gap-5 w-full">
              <HeroActions />
              <HeroKPIs isMobile={false} />
            </div>
          </div>

          {/* Columna Derecha: Mockup oficial iPhone y KPIs (Móvil) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:justify-end relative py-2 lg:py-0 w-full">
            <HeroMockup onClick={handlePublishClick} />
            <HeroKPIs isMobile={true} />
          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
