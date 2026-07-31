import React from 'react';
import { m as motion } from 'framer-motion';

import { companyPlans } from '../../data/companyPlans';
import { useAuth } from '../../context/AuthContext';
import PagePricingCard from '../../components/pricing/PagePricingCard';
import FlashHireCard from '../../components/pricing/FlashHireCard';
import SEO from '../../components/common/SEO';

// =====================================================================
// === ANIMATION VARIANTS (High Impact) ===
// =====================================================================
const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

// =====================================================================
// === MAIN PAGE COMPONENT ===
// =====================================================================

const PlanesPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            <SEO 
                title="Planes y Precios | Turnes para Empresas"
                description="Planes flexibles diseñados para escalar. Desde cubrir una vacante urgente hasta gestionar cientos de turnos al mes."
            />

            <main className="pt-12 md:pt-16 pb-24 text-zinc-200 relative overflow-hidden">

                {/* --- AMBIENT BACKGROUNDS (Optimized) --- */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* --- HEADER (Marketing Focus) --- */}
                    <motion.header
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                            No pagues de más
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                            Invierte en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Velocidad</span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Planes flexibles diseñados para escalar. Desde cubrir una vacante urgente hasta gestionar cientos de turnos al mes.
                        </p>
                    </motion.header>

                    {/* --- PRICING GRID --- */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {companyPlans.map((plan) => (
                            <PagePricingCard key={plan.id} plan={plan} userLoggedIn={!!user} />
                        ))}
                    </motion.div>

                    {/* --- ONE-TIME PURCHASE SECTION (Static) --- */}
                    <FlashHireCard />

                </div>
            </main>
        </div>
    );
};

export default PlanesPage;