import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Cookie, ShieldCheck, BarChart3, Target } from 'lucide-react';
import CtaSection from '../../components/common/CtaSection';


const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const brandPrimary = 'emerald-400';
const cardColor = 'zinc-950';
const cardTextColor = 'zinc-400';

const PolicySection = ({ id, title, children }) => (
    <motion.section id={id} className="mb-10 pt-4 scroll-mt-24" variants={fadeInUp}>
        <h2 className={`text-xl font-black border-b border-white/5 pb-3 text-white uppercase tracking-widest`}>
            {title}
        </h2>
        <div className={`mt-4 text-${cardTextColor} text-sm leading-relaxed font-medium`}>{children}</div>
    </motion.section>
);

const CookiePolicyPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-manrope">
            <main className="flex-grow pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    
                    {/* --- HERO --- */}
                    <motion.header className="text-center mb-20" variants={fadeInUp} initial="hidden" animate="visible">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Privacidad Garantizada</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter">
                            Política de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Cookies
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
                            En Turnes utilizamos cookies para que tu búsqueda de talento sea más rápida, segura y personalizada. 
                            Transparencia total sobre cómo cuidamos tu navegación.
                        </p>
                    </motion.header>

                    {/* --- CONTENT --- */}
                    <motion.div
                        className={`max-w-4xl mx-auto bg-${cardColor} p-8 md:p-16 rounded-[2.5rem] border border-white/5 shadow-2xl`}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        <div className="pb-8 mb-12 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Transparencia Legal</h2>
                                <p className="text-xs text-zinc-600 mt-2 font-bold uppercase tracking-wider">Versión 1.0 | Actualizada: Mayo 2024</p>
                            </div>
                            <Cookie size={40} className="text-emerald-500/20" />
                        </div>

                        <PolicySection title="1. ¿Qué son las cookies?">
                            <p>
                                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu ordenador, smartphone o tablet cuando los visitas. 
                                En Turnes, las usamos para recordar tus preferencias de búsqueda, mantener tu sesión segura y entender cómo interactúas con nuestra plataforma.
                            </p>
                        </PolicySection>

                        <PolicySection title="2. ¿Cómo las clasificamos?">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <CookieCard 
                                    icon={<Shield className="text-blue-400" />}
                                    title="Esenciales"
                                    desc="Permiten que la web funcione. Sin ellas, no podrías iniciar sesión ni publicar vacantes."
                                />
                                <CookieCard 
                                    icon={<BarChart3 className="text-emerald-400" />}
                                    title="Analíticas"
                                    desc="Nos ayudan a medir cuánta gente nos visita y qué funciones son las más útiles."
                                />
                                <CookieCard 
                                    icon={<Target className="text-purple-400" />}
                                    title="Marketing"
                                    desc="Se usan para mostrarte ofertas de trabajo o talento que realmente te interese."
                                />
                            </div>
                        </PolicySection>

                        <PolicySection title="3. Cookies de terceros">
                            <p>
                                En algunos casos, utilizamos servicios de terceros (como Google Analytics o Píxeles de Meta) que pueden instalar sus propias cookies. 
                                Estos servicios nos ayudan a optimizar nuestras campañas y entender mejor las necesidades del mercado laboral. 
                                Puedes bloquear estas cookies sin que afecte a las funciones básicas de Turnes.
                            </p>
                        </PolicySection>

                        <PolicySection title="4. Control y Gestión">
                            <p>
                                Tienes el control total. Puedes cambiar tus preferencias en cualquier momento desde nuestro **Panel de Configuración de Cookies** 
                                (accesible desde el banner inferior) o configurando tu navegador para bloquearlas. 
                                Ten en cuenta que bloquear cookies esenciales impedirá que la plataforma funcione correctamente.
                            </p>
                        </PolicySection>

                        <PolicySection title="5. Contacto">
                            <p>
                                Si tienes dudas sobre cómo tratamos tu información o sobre esta política, puedes contactar con nuestro equipo de privacidad en:
                                <br /><br />
                                <span className="text-white font-bold">Email:</span> privacidad@turnes.com
                            </p>
                        </PolicySection>

                    </motion.div>

                    <div className="mt-20">
                        <CtaSection />
                    </div>
                </div>
            </main>
        </div>
    );
};

const CookieCard = ({ icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10">
            {icon}
        </div>
        <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{desc}</p>
    </div>
);

export default CookiePolicyPage;
