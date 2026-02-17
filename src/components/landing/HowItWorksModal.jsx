import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Zap, DollarSign } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: "1. Crea tu Perfil",
        desc: "Regístrate en segundos. Verifica tu identidad para acceder a mejores oportunidades o talento premium.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20"
    },
    {
        icon: Zap,
        title: "2. Recibe Ofertas",
        desc: "Nuestro algoritmo te conecta al instante. Las empresas publican, los talentos aceptan. Match en tiempo real.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20"
    },
    {
        icon: DollarSign,
        title: "3. Trabaja y Cobra",
        desc: "Completa el turno. El pago se libera automáticamente o según el acuerdo. Sin papeleos extra.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20"
    }
];

const HowItWorksModal = ({ isOpen, onClose }) => {

    // 1. Cierre con tecla ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">

                    {/* Backdrop (Cierra al hacer click fuera) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                        aria-hidden="true"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="
                relative w-full max-w-5xl 
                bg-zinc-900 border border-white/10 
                rounded-t-3xl sm:rounded-3xl 
                shadow-2xl overflow-hidden 
                max-h-[90vh] flex flex-col
            "
                        onClick={(e) => e.stopPropagation()} // Evita cerrar al clickear dentro
                    >

                        {/* Header con botón de cierre pegajoso */}
                        <div className="sticky top-0 z-50 flex justify-end p-4 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-transparent">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                                aria-label="Cerrar modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido Scrolleable */}
                        <div className="overflow-y-auto px-6 pb-12 sm:px-12 sm:pb-16 -mt-16 pt-16">

                            {/* Background Glows (Fixed aesthetics) */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="text-center mb-8 relative z-10">
                                <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">
                                    El Proceso
                                </span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                                    Así funciona <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Turnes</span>
                                </h2>
                                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
                                    Simple. Rápido. Sin letra chica.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                {steps.map((step, index) => (
                                    <div key={index} className={`p-6 rounded-2xl border ${step.border} ${step.bg} relative group hover:-translate-y-1 transition-transform duration-300`}>
                                        <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4 shadow-lg`}>
                                            <step.icon className={`w-6 h-6 ${step.color}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-zinc-300 text-sm leading-relaxed">{step.desc}</p>

                                        {/* Step Number */}
                                        <span className="absolute top-4 right-4 text-6xl font-black opacity-[0.05] text-white pointer-events-none">
                                            {index + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 text-center relative z-10">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 rounded-lg bg-white text-zinc-950 font-bold text-sm tracking-wide hover:bg-zinc-200 transition-colors shadow-lg active:scale-95 transform duration-100"
                                >
                                    ¡Entendido!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HowItWorksModal;
