import React from 'react';
import SectionCard from '../profile/shared/SectionCard';
import PricingCard from '../pricing/PricingCard';

import { Briefcase } from 'lucide-react';

// === IMPORTACIONES MODULARES ===
// 🛠️ CORRECCIÓN: Se elimina la definición local de companyPlans.
// La variable companyPlans AHORA DEBE SER IMPORTADA desde su archivo de datos real.
import { companyPlans } from '../../data/companyPlans'; 

/**
 * Componente RolPricingBlock
 * Muestra la sección modular de Planes y Ahorro para Empresas.
 * Usa SectionCard para el estilo base y PricingCard para cada plan.
 */
const RolPricingBlock = () => {
    // Verificar si los datos están disponibles
    // 💡 NOTA: companyPlans DEBE SER IMPORTADO correctamente de '../data/companyPlans'
    const plans = Array.isArray(companyPlans) ? companyPlans : [];

    return (
        <SectionCard 
            title="Planes de Empresa y Ahorro" 
            icon={<Briefcase />} 
            accent="indigo" 
            className="col-span-full mt-10"
        >
            <p className="text-gray-400 mb-6">Elige el plan que se adapte al ritmo de contratación de tu negocio y optimiza tus costos fijos y por turno.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.length > 0 ? (
                    plans.map((plan, index) => (
                        // Asumimos que PricingCard usa los datos y el Link a /precios
                        <PricingCard key={index} plan={plan} />
                    ))
                ) : (
                    // Mensaje de error si la importación de datos falla
                    <p className="text-red-400 col-span-full">Error: Componente PricingCard o datos companyPlans no cargados. Por favor, crea y exporta 'companyPlans' en '../../data/companyPlans'.</p>
                )}
            </div>
        </SectionCard>
    );
};

export default RolPricingBlock;