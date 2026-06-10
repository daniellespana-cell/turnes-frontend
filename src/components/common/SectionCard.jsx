import { motion } from 'framer-motion';

import React from 'react';

// Definición de la variante de animación (debe coincidir con la usada en DetalleRolPage)
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

/**
 * Componente Tarjeta de Sección (SectionCard)
 * Proporciona el estilo base (fondo gris oscuro, borde, sombra) y la animación de entrada
 * a las secciones modulares (como Planes o Microservicios).
 *
 * @param {string} title - Título principal de la sección.
 * @param {React.ReactNode} children - Contenido interno de la tarjeta.
 * @param {LucideIcon} icon: Ícono de lucide-react para el título.
 * @param {string} accent: Color Tailwind para el ícono (e.g., 'indigo', 'amber').
 * @param {string} className: Clases adicionales para el contenedor.
 */
const SectionCard = ({ title, children, icon: Icon, accent, className = "" }) => (
    <motion.div
        variants={fadeInUp}
        className={`bg-zinc-900/30 p-8 rounded-3xl transition-all duration-500 ${className}`}
    >
        {/* Encabezado con ícono y color de acento */}
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 text-white`}>
            {/* El ícono se renderiza solo si se proporciona */}
            {Icon && <Icon size={24} className={`text-${accent}-400`} />}
            {title}
        </h3>
        {/* Contenido Modular */}
        {children}
    </motion.div>
);

export default SectionCard;