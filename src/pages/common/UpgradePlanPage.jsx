import React from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SubscriptionPlanCard from '../../components/pricing/SubscriptionPlanCard';
import MicroserviceCard from '../../components/pricing/MicroserviceCard';
import UpgradeSkeleton from '../../components/pricing/UpgradeSkeleton';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import pricingService from '../../services/pricingService';


const UpgradePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, servicesData] = await Promise.all([
          pricingService.getPlans(),
          pricingService.getMicroservices('EMPRESAS') // 🎯 Filtro estricto: Solo mostrar microservicios para empresas
        ]);

        // 1. Separar planes reales de microservicios camuflados y eliminar el plan 'Gratuito' duplicado
        const regularPlans = plansData.filter(p => !['verify', 'boost', 'gratis', 'gratuito'].includes(p.slug));

        // 2. Transformar los camuflados para renderizarlos como tarjetas de servicios compactas
        const migratedServices = plansData
          .filter(p => ['verify', 'boost'].includes(p.slug))
          .map(p => ({
            id: p.slug, // Mantener el slug como ID para el routing /plan-action/:slug
            title: p.nombre,
            description: p.description,
            price: p.costo_mensual,
            target_audience: 'EMPRESAS'
          }));

        // 3. Filtrar los servicios antiguos/residuales que tienen el mismo propósito para evitar duplicidad visual
        const cleanServicesData = servicesData.filter(s => {
          const t = s.title.toLowerCase();
          return !t.includes("urgent") && !t.includes("verificaci");
        });

        setPlans(regularPlans);
        setServices([...migratedServices, ...cleanServicesData]);
      } catch (err) {
        console.error("Error loading upgrade data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpgrade = (slugOrId) => {
    navigate(`/plan-action/${slugOrId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="py-8 md:py-12 px-4 min-h-full font-manrope">
      {/* Dynamic Background Hints */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>
      <header className="mb-8 md:mb-12 text-center relative z-10 pt-4">
        {/* Back Button - Visible on Mobile and Desktop */}
        <div className="absolute top-4 left-0 md:-left-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 rounded-full transition-all group flex items-center justify-center backdrop-blur-sm"
            title="Volver"
            type="button">
            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" size={24} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-400 backdrop-blur-md">
            Planes & Precios
          </span>
          <h2 className="mt-4 text-xl md:text-2xl font-bold text-white tracking-tight">
            Desbloquea el máximo potencial de tu empresa.
          </h2>
        </motion.div>
      </header>
      {loading ? (
        <UpgradeSkeleton />
      ) : (
        <>
          {/* PLANS SECTION */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10 mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan) => {
              const currentPlanSlug = (user?.plan || 'basic').toLowerCase();
              const isCurrent = currentPlanSlug === plan.slug.toLowerCase();
              
              const currentPlanObj = plans.find(p => p.slug.toLowerCase() === currentPlanSlug);
              const currentPlanPrice = currentPlanObj ? currentPlanObj.costo_mensual : 0;
              const isDowngrade = plan.costo_mensual < currentPlanPrice;

              return (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={isCurrent}
                  isDowngrade={isDowngrade}
                  handleUpgrade={handleUpgrade}
                  cardVariants={cardVariants}
                />
              );
            })}
          </motion.div>

          {/* MICROSERVICES SECTION */}
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-xl font-bold text-white tracking-tight">Potencia tu Operación</h3>
              <p className="text-sm text-zinc-400 mt-2">Pagos únicos para necesidades específicas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <MicroserviceCard
                  key={service.id}
                  service={service}
                  handleUpgrade={handleUpgrade}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UpgradePlanPage;