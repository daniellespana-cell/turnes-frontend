import React, { Suspense } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/landing/LoadingSpinner';
import Hero from '../../components/landing/Hero';
import ValueProps from '../../components/landing/ValueProps';
import SEO from '../../components/common/SEO';

import { lazy } from 'react';
import { Helmet } from 'react-helmet-async';

const JobCarousel = lazy(() => import('../../components/landing/JobCarousel'));
const Beneficios = lazy(() => import('../../components/landing/Beneficios'));
const TestimoniosSection = lazy(() => import('../../components/landing/Testimonios'));
const FAQSection = lazy(() => import('../../components/landing/FAQ'));

// Schema.org JSON-LD: Le dice a Google exactamente qué es Turnes.
// Genera Rich Results (resultados enriquecidos) y mejora el posicionamiento.
const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://turnes.co/#organization",
      "name": "Turnes",
      "url": "https://turnes.co",
      "logo": "https://turnes.co/logo-turnes.png",
      "description": "Infraestructura tecnológica del trabajo operativo bajo demanda en Latinoamérica.",
      "foundingLocation": { "@type": "Place", "name": "Bucaramanga, Colombia" },
      "areaServed": ["Colombia", "Latinoamérica"],
      "sameAs": [
        "https://www.instagram.com/turnes.co/",
        "https://facebook.com/Turnes.co"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Turnes",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "url": "https://turnes.co",
      "description": "Plataforma de trabajo operativo bajo demanda. Cubre turnos en minutos con talento verificado.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "COP" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "50" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cuánto tiempo tarda en cubrirse un turno?",
          "acceptedAnswer": { "@type": "Answer", "text": "El promedio en Turnes es de 2 horas para turnos inmediatos con personal verificado." }
        },
        {
          "@type": "Question",
          "name": "¿Cómo consigo trabajo por turnos en Bucaramanga?",
          "acceptedAnswer": { "@type": "Answer", "text": "Regístrate como Talento en Turnes, completa tu perfil y empieza a recibir ofertas de turnos en Bucaramanga y Girón." }
        },
        {
          "@type": "Question",
          "name": "¿Cómo contratar un mesero urgente en Colombia?",
          "acceptedAnswer": { "@type": "Answer", "text": "En Turnes puedes publicar un turno en minutos y recibir candidatos verificados de inmediato, sin procesos de selección largos." }
        }
      ]
    }
  ]
};

const LandingPage = () => {
  return (
    <div className="landing-page bg-zinc-950 min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title="Turnes | Tu operación no puede detenerse — Infraestructura del Trabajo Operativo en LATAM" 
        description="Cubre turnos operativos en minutos con talento verificado cerca de ti. Sin bolsa de empleo, sin burocracia. La plataforma de trabajo bajo demanda para negocios en Bucaramanga, Girón y Colombia."
        url="https://turnes.co"
        image="https://turnes.co/turnes-og-logo-v2.png"
      />
      {/* Schema.org: JSON-LD para Google Rich Results */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>
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
