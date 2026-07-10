import React, { Suspense } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/landing/LoadingSpinner';
import Hero from '../../components/landing/Hero';
import ValueProps from '../../components/landing/ValueProps';
import SEO from '../../components/common/SEO';

import { lazy } from 'react';

const JobCarousel = lazy(() => import('../../components/landing/JobCarousel'));
const Beneficios = lazy(() => import('../../components/landing/Beneficios'));
const TestimoniosSection = lazy(() => import('../../components/landing/Testimonios'));
const FAQSection = lazy(() => import('../../components/landing/FAQ'));


const LandingPage = () => {
  return (
    <div className="landing-page bg-zinc-950 min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title="Turnes | La Plataforma de Contratación para Microempresas Más Rápida y Confiable" 
        description="Conectamos a los mejores profesionales de hospitalidad y construcción con empresas que exigen excelencia. Turnos rápidos, seguros y verificados." 
      />
      <Navbar />
      <main className="lp-main-content flex-grow">
        <Hero />
        <ValueProps />
        <Suspense fallback={<LoadingSpinner />}>
          <JobCarousel />
          <Beneficios />
          <TestimoniosSection />
          <FAQSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
