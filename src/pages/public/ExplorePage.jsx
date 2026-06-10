import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FeatureCard from '../../components/features/FeatureCard';
import SEO from '../../components/common/SEO';


// --- IMPORTACIONES DE LAYOUT Y COMPONENTES ---
// --- IMPORTACIONES DE LAYOUT Y COMPONENTES ---

// 🟢 Importamos los datos (coreFeatures)
import { coreFeatures } from '../../data/featuresData.js';

// 🟢 Importamos el componente atómico FeatureCard
// 🛑 CORREGIDO: Eliminamos la extensión .jsx para evitar el error de resolución de ruta en Vite


// =====================================================================
// === LÓGICA DE ORQUESTACIÓN ===
// =====================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};
const staggerContainer = {
    visible: { transition: { staggerChildren: 0.15 } }
};


const ExplorePage = () => {
    return (
        <div className="min-h-screen bg-zinc-950 selection:bg-emerald-500/30 selection:text-emerald-200">
            <SEO 
                title="Explorar Características | Turnes" 
                description="Descubre todas las características tecnológicas que hacen de Turnes la plataforma líder: Inteligencia Artificial, Pagos Seguros, Verificación de Identidad y Billetera Integrada." 
            />
            {/* Navbar removed (handled by MainLayout) */}

            <main className="pt-16 md:pt-24 pb-20 text-white relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Encabezado Principal */}
                    <motion.header
                        className="text-center mb-16"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                            Todo lo que Turnes te <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                Permite Lograr
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed">
                            Tecnología diseñada para la velocidad, seguridad y la eliminación de la fuga de talento. Única en el mercado.
                        </p>
                    </motion.header>

                    {/* --- SECCIÓN DE CARACTERÍSTICAS --- */}
                    <motion.section
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* 🟢 Mapeo del componente FeatureCard */}
                        {coreFeatures.map((feature) => (
                            <FeatureCard key={feature.id} feature={feature} />
                        ))}
                    </motion.section>

                    {/* --- CTA: Llamada a la Acción Final --- */}
                    <div className="mt-20 p-8 md:p-12 bg-white/5 backdrop-blur-md rounded-2xl border border-transparent text-center  skew-y-0  transition-colors">
                        <h3 className="text-2xl font-bold text-white mb-4">¿Listo para unirte a la red?</h3>
                        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                            Publica tu primer turno y experimenta la velocidad de contratación instantánea.
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 text-sm font-bold text-black py-3 px-8 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] hover:-translate-y-1"
                        >
                            Regístrate Ahora
                            <ArrowRight size={18} />
                        </a>
                    </div>

                </div>
            </main>

            {/* Footer removed (handled by MainLayout) */}
        </div>
    );
};

export default ExplorePage;