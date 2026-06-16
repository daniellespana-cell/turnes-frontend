import React from 'react';
import { Building2, CreditCard } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import InputField from '../shared/InputField';
import LocationSelector from '../shared/LocationSelector';


const BillingInfoSection = ({ formData, handleInputChange, isEditing }) => {
    
    const handleLocationChange = (cityName, coords) => {
        // Guardamos el nombre en el campo de dirección
        handleInputChange('address', cityName);
        // Y las coordenadas en campos técnicos (lat, lng) que el servicio usará
        if (coords) {
            handleInputChange('lat', coords.lat);
            handleInputChange('lng', coords.lng);
        }
    };

    return (
        <SectionCard title="Datos de Facturación" icon={<Building2 size={14} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                    label="Nombre de Empresa"
                    value={formData.company || ''}
                    onChange={v => handleInputChange('company', v)}
                    disabled={!isEditing}
                    icon={<Building2 size={12} />}
                />
                <InputField
                    label="NIT / Identificación"
                    value={formData.nit || ''}
                    onChange={v => handleInputChange('nit', v)}
                    disabled={!isEditing}
                    icon={<CreditCard size={12} />}
                />
                <LocationSelector
                    label="Dirección Fiscal / Ciudad de Operación"
                    value={formData.address || ''}
                    onChange={handleLocationChange}
                    disabled={!isEditing}
                />
            </div>
        </SectionCard>
    );
};

export default BillingInfoSection;
