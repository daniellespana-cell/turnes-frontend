import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';
import ContactInfo from '../../components/contact/ContactInfo';
import ContactForm from '../../components/contact/ContactForm';


import { useContactForm } from '../../hooks/useContactForm';

// Animaciones
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ContactPage = () => {
    const { formData, status, handleChange, handleSubmit, resetForm } = useContactForm();

    return (
        <div className="min-h-screen bg-zinc-950 selection:bg-emerald-500/30 selection:text-emerald-200">
            <SEO 
                title="Contacto | Turnes - Soporte y Ayuda" 
                description="¿Tienes preguntas sobre Turnes? Nuestro equipo de soporte está listo para ayudarte a llenar tu vacante o resolver tus dudas. Contáctanos hoy." 
            />
            <main className="pt-28 md:pt-36 pb-16 text-white relative overflow-hidden">
                {/* Background Decor (Similar to Landing) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Encabezado Principal */}
                    <motion.header
                        className="text-center mb-12"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                            Hablemos de tu <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                Próximo Turno
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Estamos aquí para ayudarte a llenar tu vacante en tiempo récord.
                        </p>
                    </motion.header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">

                        {/* --- COLUMNA 1: CONTACTO DETALLADO (UI Component) --- */}
                        <motion.div
                            className="h-full"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <ContactInfo />
                        </motion.div>


                        {/* --- COLUMNA 2 & 3: FORMULARIO DE CONTACTO (UI Component + Hook Props) --- */}
                        <motion.div
                            className="lg:col-span-2"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <ContactForm
                                formData={formData}
                                status={status}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                resetForm={resetForm}
                            />
                        </motion.div>

                    </div>
                </div>
            </main>

        </div>
    );
};

export default ContactPage;