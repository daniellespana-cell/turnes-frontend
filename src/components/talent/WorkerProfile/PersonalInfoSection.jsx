import React from 'react';
import { User, Mail } from 'lucide-react';
import SectionCard from '../../profile/shared/SectionCard';
import InputField from '../../profile/shared/InputField';
import CityAutocomplete from '../../profile/shared/CityAutocomplete';

/**
 * Sección de Información Personal del perfil del trabajador.
 *
 * "Ubicación Base" usa CityAutocomplete (componente compartido) respaldado
 * por la taxonomy geográfica de Turnes (useCiudades + CIUDADES_COORDS).
 * Esto garantiza:
 *   1. Autocompletado real con dropdown (no datalist nativo)
 *   2. Resolución automática de lat/lng al seleccionar ciudad
 *   3. Soporte correcto para el algoritmo de match geográfico
 */
const PersonalInfoSection = ({ formData, handleInputChange, isEditing }) => {

    // Resolución de coordenadas al seleccionar ciudad
    // coords = { lat, lng } → match exacto, coords = null → campo borrado,
    // coords = undefined → tipeando (no tocar las coords existentes)
    const handleCityChange = (cityName, coords) => {
        handleInputChange('location', cityName);
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
                
                {/* Teléfono (Privado) */}
                <div className="flex flex-col gap-1">
                    <InputField
                        label="WhatsApp / Teléfono (Privado)"
                        value={formData.phone || ''}
                        onChange={v => handleInputChange('phone', v)}
                        disabled={!isEditing}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>}
                    />
                    <p className="text-[9px] text-zinc-500 px-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Solo visible para Turnes, oculto para las empresas.
                    </p>
                </div>

                {/* Ubicación Base — CityAutocomplete con resolución de coordenadas */}
                <CityAutocomplete
                    value={formData.location || ''}
                    onChange={handleCityChange}
                    disabled={!isEditing}
                    label="Ubicación Base"
                    id="worker-location-combobox"
                />
                <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                            Bio / Presentación
                        </label>
                    </div>
                    <textarea
                        value={formData.bio || ''}
                        onChange={e => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ej: Tengo 3 años de experiencia en servicio al cliente..."
                        rows={3}
                        className={`
                            w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white resize-none
                            placeholder:text-zinc-700 outline-none transition-all duration-200
                            ${isEditing
                                ? 'border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 cursor-text'
                                : 'border-zinc-800/50 opacity-60 cursor-default'}
                        `}
                    />
                </div>
            </div>
        </SectionCard>
    );
};

export default PersonalInfoSection;
