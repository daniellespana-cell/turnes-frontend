import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowRight, Star, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import NotFound from './NotFound';
import SEOHead from '../components/seo/SEOHead';

// === IMPORTACIONES MODULARES ===
import RolPricingBlock from '../components/sections/RolPricingBlock.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import { getRoleBySlug } from '../domain/vacantes.taxonomy';
import TurnesButton from '../components/ui/TurnesButton';

// =====================================================================
// === ANIMATION VARIANTS ===
// =====================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

// =====================================================================
// === PÁGINA PRINCIPAL ===
// =====================================================================

const DetalleRolPage = () => {
    const { rolSlug } = useParams();
    const navigate = useNavigate();

    // 1. Buscamos el rol en la Taxonomía Central (Domain)
    const roleNode = getRoleBySlug(rolSlug);

    // 2. Validamos que exista y tenga data de marketing
    if (!roleNode || !roleNode.marketing) {
        return <NotFound />;
    }

    // 3. Extraemos la data de presentación
    const rol = roleNode.marketing;
    const { accentColor } = rol;

    // ✅ SEO Dinámico & Google Jobs JSON-LD
    const jobSchema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": rol.job.title,
        "description": rol.description,
        "identifier": {
            "@type": "PropertyValue",
            "name": "Turnes",
            "value": roleNode.id
        },
        "datePosted": new Date().toISOString().split('T')[0],
        "validThrough": new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        "employmentType": "CONTRACTOR",
        "hiringOrganization": {
            "@type": "Organization",
            "name": "Turnes",
            "sameAs": "https://turnes.app",
            "logo": "https://turnes.app/logo.png"
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bogotá",
                "addressRegion": "Cundinamarca",
                "addressCountry": "CO"
            }
        },
        "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "COP",
            "value": {
                "@type": "QuantitativeValue",
                "value": 60000,
                "unitText": "HOUR"
            }
        }
    };

    // Leyenda comercial unificada
    const shortSummary = "Conecta con los mejores talentos de forma flexible. Turnos verificados al instante, sin ataduras contractuales.";

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

            {/* 🚀 SEO INJECTION */}
            <SEOHead
                title={`${rol.title} - Empleos por Turnos`}
                description={`Encuentra trabajo de ${rol.title} en Bogotá. ${shortSummary}`}
                jsonLd={jobSchema}
            />

            <main className="flex-grow pt-24 pb-20 relative overflow-hidden">

                {/* --- BACKGROUND GLOWS (Futuristic) --- */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* ✅ Navegación (Back Button) */}
                    <div className="mb-8">
                        <Link to="/explorar" className="inline-flex items-center text-zinc-400 hover:text-emerald-400 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium tracking-wide">Volver a Explorar</span>
                        </Link>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* --- 1. HEADER (Futuristic Typography) --- */}
                        <motion.header variants={fadeInUp} className="text-center mb-16 pt-8 pb-4 border-b border-white/5">

                            {/* Micro-Interaction Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md mb-6 hover:bg-emerald-500/20 transition-colors cursor-default">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase">
                                    Rol Verificado
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter leading-tight">
                                <span className="block text-zinc-400 text-lg md:text-xl font-medium tracking-widest uppercase mb-2 font-mono">Oportunidades para</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 filter drop-shadow-lg">
                                    {rol.title}
                                </span>
                            </h1>

                            <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
                                {rol.description}
                            </p>
                        </motion.header>

                        {/* --- CUERPO DE TARJETAS (Grid de 2 columnas) --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* --- Tarjeta Principal de Oferta (Ocupa 2/3) --- */}
                            <motion.div variants={fadeInUp} className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hover:border-emerald-500/30 transition-colors duration-500 group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 mb-6 gap-4">
                                    <div>
                                        <span className="text-xs font-mono text-emerald-500 mb-1 block">EJEMPLO REAL</span>
                                        <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">{rol.job.title}</h2>
                                    </div>
                                    <span className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">{rol.job.salary}</span>
                                </div>

                                <p className="text-base text-zinc-400 mb-8 leading-relaxed font-light">
                                    {shortSummary}
                                </p>

                                {/* Detalles del Rol */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-zinc-400 mb-8 text-sm">
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><MapPin size={18} /></div>
                                        <div><span className="block text-xs text-zinc-500 uppercase">Ubicación</span><span className="text-white font-medium">{rol.job.location}</span></div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><Clock size={18} /></div>
                                        <div><span className="block text-xs text-zinc-500 uppercase">Duración</span><span className="text-white font-medium">{rol.job.hours}</span></div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400"><User size={18} /></div>
                                        <div><span className="block text-xs text-zinc-500 uppercase">Modalidad</span><span className="text-white font-medium">Freelance / Turno</span></div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Star size={18} /></div>
                                        <div><span className="block text-xs text-zinc-500 uppercase">Calificación</span><span className="text-white font-medium">4.8/5.0</span></div>
                                    </div>
                                </div>

                                {/* Requisitos (Opcional) */}
                                {rol.job.reqs && rol.job.reqs.length > 0 && (
                                    <>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-3">Requisitos Indispensables</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-400 text-sm mb-8">
                                            {rol.job.reqs.map((req, index) => (
                                                <li key={index} className="flex items-center gap-3">
                                                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {/* CTA Postúlate */}
                                <div className="mt-10 border-t border-white/5 pt-8">
                                    <TurnesButton
                                        onClick={() => navigate('/register?role=jobseeker')}
                                        variant="primary"
                                        size="lg"
                                        icon={ArrowRight}
                                        className="w-full md:w-fit shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                    >
                                        Aplicar a Turnos Como Este
                                    </TurnesButton>
                                    <p className="text-xs text-zinc-500 mt-3 text-center md:text-left">
                                        Crea tu perfil gratis en 2 minutos. Sin comisiones ocultas.
                                    </p>
                                </div>
                            </motion.div>

                            {/* --- Tarjeta Lateral de Venta (Ocupa 1/3) --- */}
                            <motion.div variants={fadeInUp} className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl h-fit hover:border-indigo-500/30 transition-colors duration-500">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg"><Info size={20} className="text-indigo-400" /></div>
                                    ¿Eres una Empresa?
                                </h3>
                                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                                    ¿Necesitas un <strong>{rol.title}</strong> para este fin de semana? Publícalo ya y recibe candidatos verificados en minutos.
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        <span>Sin contratos fijos ni papeleo.</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        <span>Pago instantáneo y seguro.</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        <span>Garantía de cumplimiento.</span>
                                    </div>
                                </div>

                                <TurnesButton
                                    onClick={() => navigate('/precios')}
                                    variant="secondary"
                                    size="md"
                                    className="w-full"
                                    icon={ArrowRight}
                                >
                                    Ver Planes de Empresa
                                </TurnesButton>
                            </motion.div>

                        </div>

                        {/* --- 2. SECCIÓN DE PLANES (Modular) --- */}
                        <motion.div variants={fadeInUp}>
                            <RolPricingBlock />
                        </motion.div>

                    </motion.div>
                </div>
            </main>

        </div>
    );
};

export default DetalleRolPage;