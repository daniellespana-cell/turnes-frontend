import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

// --- IMPORTACIONES DE LAYOUT Y COMPONENTES ---
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ContactForm from '../components/forms/ContactForm.jsx'; // 🟢 Importamos el componente de formulario modular


// =====================================================================
// === DATOS DE CONTACTO (MOCK - Para entorno real irían en un .js) ===
// =====================================================================
const contactInfo = [
    { icon: Phone, label: "Teléfono", value: "+57 (601) 555-5555", description: "Llamada directa para soporte urgente." },
    { icon: Mail, label: "Email de Soporte", value: "soporte@turnes.co", description: "Respuesta en menos de 24 horas hábiles." },
    { icon: Clock, label: "Horario de Atención", value: "Lun - Vie: 8:00 AM - 6:00 PM (COT)", description: "Horario continuado de soporte técnico." },
    { icon: MapPin, label: "Ubicación", value: "Bogotá D.C., Colombia", description: "Sede administrativa (solo por cita)." },
];

// Animaciones
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};


const ContactPage = () => {
    return (
        <div className="min-h-screen bg-app">
            <Navbar />
            
            <main className="pt-24 md:pt-32 pb-20 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Encabezado Principal */}
                    <motion.header 
                        className="text-center mb-16"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
                            Hablemos de tu <span className="text-brand-primary">Próximo Turno</span>
                        </h1>
                        <p className="text-xl text-secondary max-w-4xl mx-auto">
                            ¿Tienes preguntas sobre planes, soporte o integraciones? Estamos aquí para ayudarte a llenar tu vacante.
                        </p>
                    </motion.header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
                        
                        {/* --- COLUMNA 1: CONTACTO DETALLADO --- */}
                        <motion.div 
                            className="space-y-8 p-6 bg-surface rounded-xl shadow-lg h-full"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <h2 className="text-2xl font-bold text-brand-success border-b border-zinc-700 pb-3">
                                Información de Soporte
                            </h2>
                            {contactInfo.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1 p-2 bg-zinc-800 rounded-full">
                                            <Icon className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-400">{item.label}</p>
                                            <p className="text-lg font-bold text-white">{item.value}</p>
                                            <p className="text-xs text-zinc-500">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>


                        {/* --- COLUMNA 2 & 3: FORMULARIO DE CONTACTO --- */}
                        <motion.div 
                            className="lg:col-span-2 p-8 bg-surface rounded-xl shadow-2xl"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-extrabold text-white mb-6">Envíanos un Mensaje</h2>
                            
                            {/* 🟢 DELEGACIÓN: El componente ContactForm maneja toda la lógica del formulario */}
                            <ContactForm />

                        </motion.div>

                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ContactPage;