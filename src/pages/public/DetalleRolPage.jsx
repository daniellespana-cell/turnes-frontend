import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { m as motion } from 'framer-motion';

import NotFound from '../common/NotFound';
import SEOHead from '../../components/seo/SEOHead';
import RolPricingBlock from '../../components/sections/RolPricingBlock';

import RoleHeader from '../../components/role-detail/RoleHeader';
import RoleMainCard from '../../components/role-detail/RoleMainCard';
import RoleBusinessCard from '../../components/role-detail/RoleBusinessCard';

import { getRoleBySlug } from '../../domain/vacantes.taxonomy';
import { buildJobSchema } from '../../utils/seoHelpers';

// ─── Diccionario de slugs del Carrusel de Marketing ────────────────────────
const CAROUSEL_TITLES = {
    reposteria: 'Chef de Repostería',
    barista:    'Barista Profesional',
    cocinero:   'Cocinero Rápido',
    bartender:  'Bartender de Eventos',
    ayudante:   'Ayudante de Cocina',
    mesero:     'Mesero de Finde'
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const DetalleRolPage = () => {
    const { rolSlug } = useParams();

    let roleNode = getRoleBySlug(rolSlug);

    if (!roleNode || !roleNode.marketing) {
        if (!CAROUSEL_TITLES[rolSlug]) return <NotFound />;

        const title = CAROUSEL_TITLES[rolSlug];
        roleNode = {
            id:       rolSlug,
            label:    title,
            marketing: {
                title,
                accentColor: 'emerald',
                description: `Únete a la red de ${title} en Turnes y encuentra turnos flexibles, pagos inmediatos y locales verificados en tu ciudad.`,
                job: {
                    title:    `Vacante de ${title}`,
                    salary:   'Pago x Hora / Turno',
                    location: 'Múltiples Zonas',
                    hours:    'Turnos Flexibles',
                    reqs:     ['Experiencia comprobable', 'Disponibilidad inmediata', 'Actitud y compromiso']
                }
            }
        };
    }

    const rol = roleNode.marketing;
    const jobSchema = buildJobSchema(roleNode);
    const shortSummary = "Conecta con los mejores talentos de forma flexible. Turnos verificados al instante, sin ataduras contractuales.";

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            <SEOHead
                title={`${rol.title} - Empleos por Turnos`}
                description={`Encuentra trabajo de ${rol.title} en Girón. ${shortSummary}`}
                jsonLd={jobSchema}
            />

            <main className="flex-grow pt-24 pb-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-8">
                        <Link to="/explorar" className="inline-flex items-center text-zinc-400 hover:text-emerald-400 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium tracking-wide">Volver a Explorar</span>
                        </Link>
                    </div>

                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                        <RoleHeader rol={rol} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <RoleMainCard rol={rol} shortSummary={shortSummary} />
                            <RoleBusinessCard rol={rol} />
                        </div>

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