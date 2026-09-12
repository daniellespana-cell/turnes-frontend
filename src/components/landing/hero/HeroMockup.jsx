import React from 'react';
import { m as motion } from 'framer-motion';

const heroPhoneMockup = '/iphone-turnes-hero.webp';

const HeroMockup = ({ onClick }) => {
  return (
    <div className="relative py-2 lg:py-0 w-full flex justify-center">
      {/* Resplandor ambiental sobrio y mate detrás del iPhone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[340px] lg:w-[400px] h-[320px] sm:h-[420px] lg:h-[460px] bg-[#064e3b]/25 blur-[80px] lg:blur-[110px] rounded-full pointer-events-none" />

      {/* Mockup iPhone 16 Pro con la App Turnes (Imagen Oficial Aprobada) */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onClick={onClick}
        className="relative w-full max-w-[240px] xs:max-w-[270px] sm:max-w-[320px] lg:max-w-[380px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] cursor-pointer select-none flex justify-center"
        title="Haz clic para publicar un turno"
      >
        <picture className="w-full h-auto flex justify-center">
          <source media="(max-width: 640px)" srcSet="/iphone-turnes-hero-mobile.webp" type="image/webp" />
          <source srcSet={heroPhoneMockup} type="image/webp" />
          <img
            src={heroPhoneMockup}
            alt="Mockup iPhone 16 Pro con la App Turnes"
            className="w-full h-auto object-contain pointer-events-none"
            width="760"
            height="1018"
            loading="eager"
            decoding="async"
          />
        </picture>
      </motion.div>
    </div>
  );
};

export default HeroMockup;
