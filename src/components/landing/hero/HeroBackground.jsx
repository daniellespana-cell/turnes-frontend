import React from 'react';

const heroBackgroundWebp = '/hero-bg-kitchen.webp';
const heroBackgroundMobileWebp = '/hero-bg-kitchen-mobile.webp';

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 select-none overflow-hidden">
      <picture className="w-full h-full">
        <source media="(max-width: 640px)" srcSet={heroBackgroundMobileWebp} type="image/webp" />
        <source srcSet={heroBackgroundWebp} type="image/webp" />
        <img
          src={heroBackgroundWebp}
          alt="Personal de cocina gourmet y servicio en restaurante"
          className="w-full h-full object-cover object-center brightness-100 contrast-[1.02]"
          width="1376"
          height="768"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>
      {/* Capa de contraste optimizada para móvil y escritorio */}
      <div className="absolute inset-0 bg-[#06090e]/85 sm:bg-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06090e]/95 via-[#06090e]/85 to-[#06090e]/40 sm:to-[#06090e]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06090e]/70 via-transparent to-[#06090e]/90" />
    </div>
  );
};

export default HeroBackground;
