import React from 'react';
import { motion } from 'framer-motion';

// Importamos el mapa de íconos y la animación
// 🟢 NOTA: Asumimos que esta ruta es correcta (src/data/IconMap.js)
import { IconMap } from '../../data/IconMap'; 

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

/**
 * Componente Tarjeta para Microservicios a la Carta (Pago Único, Perfil Destacado, etc.)
 * Muestra el servicio y lo diferencia visualmente por target (Empresas vs. Trabajadores).
 * @param {object} service - Objeto del microservicio (datos de microservicesData.js).
 */
const MicroserviceCard = ({ service }) => {
    // Obtenemos el componente Icono de Lucide React usando el nombre del string
    const IconComponent = IconMap[service.icon];
    const isWorkerTarget = service.target === 'Trabajadores';

    // 🟢 ESTILOS DE TEMA OSCURO: Usamos colores de la marca para diferenciar el target
    const colorClass = isWorkerTarget 
        ? 'bg-app border-brand-primary/50' // Trabajadores: Azul (Primario)
        : 'bg-surface border-brand-success/50'; // Empresas: Verde (Éxito)

    const iconColor = isWorkerTarget ? 'text-brand-primary' : 'text-brand-success';

    return (
        <motion.div 
            variants={fadeInUp} // Aplica la animación de aparición
            className={`p-6 rounded-xl shadow-lg border h-full flex flex-col justify-between ${colorClass} transition-all duration-300 hover:shadow-xl`}
        >
            <div className="flex-grow">
                <div className="flex items-center space-x-4">
                    {/* Contenedor del Ícono (Fondo oscuro) */}
                    <div className="p-3 rounded-full bg-zinc-800 shadow-md">
                        {IconComponent && <IconComponent className={`w-6 h-6 ${iconColor}`} />}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white">{service.title}</h4>
                        {/* Etiqueta Target */}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isWorkerTarget ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-success/20 text-brand-success'}`}>
                            Para {service.target}
                        </span>
                    </div>
                </div>
                
                <p className="mt-4 text-sm text-zinc-400">{service.description}</p>
            </div>
            
            {/* Pie de la Tarjeta (Precio) */}
            <div className="mt-4 flex items-baseline border-t border-zinc-700 pt-3">
                <span className="text-2xl font-extrabold text-white">{service.price}</span>
                <span className="ml-1 text-sm font-medium text-zinc-500">{service.priceUnit}</span>
            </div>

            {/* Botón CTA */}
            <button className={`mt-4 w-full text-sm font-medium py-2 rounded-lg transition-colors duration-200 
              ${isWorkerTarget ? 'bg-brand-primary text-white hover:bg-blue-700' : 'bg-brand-success text-black hover:bg-emerald-600'}`}>
                Comprar Ahora
            </button>
        </motion.div>
    );
};

export default MicroserviceCard;