import { motion } from 'framer-motion';

import React from 'react';

/**
 * Tarjeta de estadística reutilizable para el panel de admin.
 * @param {Object} props
 * @param {React.ElementType} props.icon - Componente de icono Lucide
 * @param {string} props.label - Etiqueta descriptiva
 * @param {string|number} props.value - Valor principal
 * @param {string} props.color - Clase de color Tailwind (ej: 'text-blue-400')
 * @param {string} [props.sub] - Subtítulo opcional
 */
const AdminStatCard = ({ icon: Icon, label, value, color, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-3 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150 ${color.replace('text-', 'bg-')}`} />
        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('/10', '/20')} ${color}`}>
            <Icon size={20} />
        </div>
        <div className="relative z-10">
            <p className="text-3xl font-black text-white tabular-nums">{value}</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">{label}</p>
            {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
        </div>
    </motion.div>
);

export default AdminStatCard;
