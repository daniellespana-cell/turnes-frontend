import React from 'react';

/**
 * ComoFuncionaHeader
 * Cabecera comercial orientada a resolver el dolor operativo de las empresas
 */
const ComoFuncionaHeader = () => {
  return (
    <header className="max-w-3xl mx-auto mb-8 sm:mb-12 px-2 sm:px-4 text-center">
      {/* Título Principal */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
        Cómo funciona Turnes <br className="hidden sm:block" />
        para tu empresa
      </h1>

      {/* Párrafo Comercial optimizado para lectura en móvil y desktop */}
      <div className="text-left sm:text-center text-zinc-300 space-y-3.5 max-w-2xl mx-auto">
        <p className="text-sm sm:text-base leading-relaxed text-zinc-200">
          <strong className="text-white font-bold">
            Sabemos la pesadilla que significa que un mesero o cocinero te cancele horas antes de abrir o en pleno pico de un fin de semana.
          </strong>{' '}
          Salir a buscar a la carrera en grupos de WhatsApp o depender del boca a boca informal te expone a personas sin verificar, ausencias de último minuto y mesas desatendidas que te hacen perder dinero y clientes.
        </p>

        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 pt-1 sm:pt-0">
          <strong className="text-emerald-400 font-semibold">Turnes nació para erradicar esa incertidumbre:</strong>{' '}
          publicas tu turno en menos de 2 minutos, accedes a personas verificadas con cédula en tu zona, coordinas detalles en tiempo real por chat o videollamada express, y haces match directo para que tu salón o cocina nunca se detengan.
        </p>
      </div>
    </header>
  );
};

export default ComoFuncionaHeader;
