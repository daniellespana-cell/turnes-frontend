import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const FlashHireCard = () => {
    return (
        <motion.div
            className="mt-20 max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/50 to-zinc-900 border border-indigo-500/30 ">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="relative md:flex items-center p-8 md:p-12 gap-12">
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-400" fill="currentColor" />
                            <span className="font-bold text-indigo-200">¿Solo necesitas un turno fijo?</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4">Contratación Flash</h3>
                        <p className="text-indigo-200/80 mb-6 leading-relaxed">
                            La solución perfecta para imprevistos. Publica una vacante fija única con visibilidad premium por 15 días. Sin suscripciones.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25 text-center"
                            >
                                Pagar Turno Único
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 flex-shrink-0 text-center md:text-right">
                        <span className="block text-sm font-medium text-indigo-300 uppercase tracking-wider mb-1">Pago Único</span>
                        <span className="block text-5xl font-black text-white tracking-tighter">$19.900</span>
                        <span className="block text-xs font-bold text-indigo-400 mt-2 bg-indigo-950/50 py-1 px-3 rounded-full inline-block">
                            IVA INCLUIDO
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FlashHireCard;
