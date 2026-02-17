import React, { lazy, Suspense } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/landing/LoadingSpinner';
import Hero from '../components/landing/Hero';
import ValueProps from '../components/landing/ValueProps';

const JobCarousel = lazy(() => import('../components/landing/JobCarousel'));
const Beneficios = lazy(() => import('../components/landing/Beneficios'));
const TestimoniosSection = lazy(() => import('../components/landing/Testimonios'));
const FAQSection = lazy(() => import('../components/landing/FAQ'));

const LandingPage = () => {
  return (
    <div className="landing-page bg-zinc-950 min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main className="lp-main-content flex-grow" role="main">
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
