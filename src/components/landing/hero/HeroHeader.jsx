import React from 'react';

const HeroHeader = () => {
  return (
    <>
      <h1
        id="hero-heading"
        className="font-sans text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.2] lg:leading-[1.14] max-w-xl lg:max-w-none text-balance"
      >
        La app que cubre tus turnos{' '}
        <span className="block sm:inline text-emerald-400 font-semibold">
          en tiempo récord.
        </span>
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-normal leading-relaxed max-w-md lg:max-w-xl text-balance">
        Conecta con personas disponibles y verificadas cerca de ti. Sin burocracia ni bolsas de empleo.
      </p>
    </>
  );
};

export default HeroHeader;
