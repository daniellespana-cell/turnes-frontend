
// 🟢 Importamos el mapa de íconos desde el archivo de datos
import { FeatureIconMap } from '../../data/featuresData.js';

// Animaciones
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

/**
 * Componente que muestra una característica individual de Turnes.
 * @param {object} feature - Objeto de característica (título, ícono, descripción).
 */
const FeatureCard = ({ feature }) => {
    const IconComponent = FeatureIconMap[feature.icon];

    return (
        <motion.div
            variants={fadeInUp}
            className="p-6 bg-white/5 backdrop-blur-md rounded-2xl  border border-transparent transform hover:scale-[1.02] hover:bg-white/10  transition-all duration-300 flex flex-col group"
        >
            {/* Contenedor del Icono */}
            <div className={`p-3 rounded-xl inline-flex mb-5 bg-zinc-900/50 border border-transparent group- transition-colors`}>
                {IconComponent && <IconComponent className={`w-8 h-8 ${feature.color}`} />}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>

            <p className="text-sm text-zinc-400 flex-grow mb-5 leading-relaxed">{feature.description}</p>

            {/* Etiqueta de Target (Empresas, Seguridad, Ambos) */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-white/5 text-emerald-400 border border-emerald-500/20 rounded-full inline-block mt-auto self-start">
                {feature.target}
            </span>
        </motion.div>
    );
};

export default FeatureCard;