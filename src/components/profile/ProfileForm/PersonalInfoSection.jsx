import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import InputField from '../shared/InputField';
import CityAutocomplete from '../shared/CityAutocomplete';

/**
 * Sección de Información Personal — Perfil de Empresa (Business).
 * Usa CityAutocomplete (componente compartido) con resolución automática
 * de coordenadas para alimentar el algoritmo de match geográfico.
 */
const PersonalInfoSection = ({ formData, handleInputChange, isEditing }) => {

    // Resolución de coordenadas al seleccionar ciudad
    // coords = { lat, lng } → match exacto, coords = null → campo borrado,
    // coords = undefined → tipeando (no tocar las coords existentes)
    const handleCityChange = (cityName, coords) => {
        handleInputChange('address', cityName);
        if (coords !== undefined) {
            handleInputChange('lat', coords?.lat ?? null);
            handleInputChange('lng', coords?.lng ?? null);
        }
    };

    return (
        <SectionCard title="Información Personal" icon={<User size={14} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                    label="Nombre Completo"
                    value={formData.name || ''}
                    onChange={v => handleInputChange('name', v)}
                    disabled={!isEditing}
                    icon={<User size={12} />}
                />
                <InputField
                    label="Correo Electrónico"
                    value={formData.email || ''}
                    onChange={v => handleInputChange('email', v)}
                    disabled={!isEditing}
                    icon={<Mail size={12} />}
                />
                <InputField
                    label="Teléfono"
                    value={formData.phone || ''}
                    onChange={v => handleInputChange('phone', v)}
                    disabled={!isEditing}
                    icon={<Phone size={12} />}
                />

                {/* Ciudad — CityAutocomplete con resolución de coordenadas */}
                <CityAutocomplete
                    value={formData.address || ''}
                    onChange={handleCityChange}
                    disabled={!isEditing}
                    label="Ciudad / Ubicación"
                    id="business-location-combobox"
                />

                <div className="md:col-span-2 space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                            Sobre Mí / Biografía
                        </label>
                    </div>
                    <textarea
                        value={formData.bio || ''}
                        onChange={e => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Escriba una breve descripción de la empresa..."
                        className={`
                            w-full min-h-[140px] bg-zinc-950/50 border rounded-xl p-4 text-base text-white resize-none
                            placeholder:text-zinc-700 outline-none transition-all duration-200
                            ${isEditing 
                                ? 'border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'border-zinc-800/50 opacity-60'}
                        `}
                    />
                </div>
            </div>
        </SectionCard>
    );
};

export default PersonalInfoSection;
