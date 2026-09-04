import React from 'react';
import SEO from '../../components/common/SEO';
import ComoFuncionaHeader from '../../components/como-funciona/ComoFuncionaHeader';
import StepPublicarTurno from '../../components/como-funciona/StepPublicarTurno';
import StepMatchChat from '../../components/como-funciona/StepMatchChat';
import StepVideollamadaRating from '../../components/como-funciona/StepVideollamadaRating';
import ComoFuncionaCTA from '../../components/como-funciona/ComoFuncionaCTA';

/**
 * ComoFuncionaPage
 * Página orquestadora de "Cómo Funciona" para empresas en Turnes
 */
const ComoFuncionaPage = () => {
  return (
    <div className="w-full text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title="Cómo Funciona para Empresas | Turnes" 
        description="Descubre cómo cubrir turnos operativos urgentes en minutos. Publica tu vacante, chatea con candidatos verificados, haz videollamada express y confirma el match sin intermediarios burocráticos." 
      />

      {/* Header Comercial */}
      <ComoFuncionaHeader />

      {/* Los 3 Pasos con Mockups en Tarjetas con Fondo Blanco */}
      <section className="space-y-10 sm:space-y-12 mb-16" aria-label="Flujo de contratación en 3 pasos">
        <StepPublicarTurno />
        <StepMatchChat />
        <StepVideollamadaRating />
      </section>

      {/* Llamado a la Acción Final */}
      <ComoFuncionaCTA />
    </div>
  );
};

export default ComoFuncionaPage;