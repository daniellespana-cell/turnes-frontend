import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Componente de Llamada a la Acción (CTA) Final.
 * Utilizado para fomentar la inscripción en la red Turnes.
 * * Se mantiene el contenido específico ya que es una CTA estándar para la plataforma.
 */
const CtaSection = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      // Estilos basados en tu paleta: bg-brand-primary/10 y border-brand-primary/50
      className="p-10 rounded-3xl bg-brand-primary/10 border-2 border-brand-primary/50 text-center relative overflow-hidden"
    >
      {/* Background Glow - Efecto visual */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -z-10"></div>
      
      <h3 className="text-3xl font-bold text-white mb-4">
        ¿Listo para unirte a la red de Turnes?
      </h3>
      <p className="text-secondary mb-8 max-w-xl mx-auto">
        Publica tu primer turno y experimenta la velocidad de contratación instantánea.
      </p>
      <a 
        href="/register"
        // Estilos del botón: bg-brand-success
        className="inline-flex items-center gap-2 text-lg font-semibold text-white py-3 px-8 rounded-xl bg-brand-success hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
      >
        Comenzar Ahora
        <ArrowRight size={20} />
      </a>
    </motion.div>
  );
};

export default CtaSection;