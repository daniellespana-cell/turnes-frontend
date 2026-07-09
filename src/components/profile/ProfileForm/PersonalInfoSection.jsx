import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import InputField from '../shared/InputField';
import TextAreaField from '../shared/TextAreaField';
import { CIUDADES_COORDS, CIUDADES_PRINCIPALES } from '../../../domain/geography.config';

/**
 * Sección de Información Personal — Perfil de Empresa (Business).
 * Incluye selector de ciudad con resolución automática de coordenadas
 * para alimentar el algoritmo de match geográfico de vacantes.
 */
const PersonalInfoSection = ({ formData, handleInputChange, isEditing }) => {
    // Al seleccionar ciudad resolvemos lat/lng automáticamente
    const handleCityChange = (cityName) => {
        handleInputChange('address', cityName);
        const coords = CIUDADES_COORDS[cityName];
        if (coords) {
            handleInputChange('lat', coords.lat);
            handleInputChange('lng', coords.lng);
        } else {
            // Ciudad tipada a mano que no está en el catálogo — limpiar coords
            handleInputChange('lat', null);
            handleInputChange('lng', null);
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

                {/* Ciudad — Combobox con resolución de coordenadas */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <MapPin size={12} className="opacity-70" />
                        Ciudad / Ubicación
                    </label>
                    <div className="relative">
                        <input
                            id="business-location-combobox"
                            list="turnes-ciudades-biz"
                            value={formData.address || ''}
                            onChange={e => handleCityChange(e.target.value)}
                            disabled={!isEditing}
                            placeholder="Ej: Bucaramanga"
                            autoComplete="off"
                            className={`
                                w-full bg-zinc-950 border rounded-xl px-4 py-3 min-h-[56px] text-base text-white
                                placeholder:text-zinc-700 outline-none transition-all duration-200
                                ${isEditing
                                    ? 'border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 cursor-text'
                                    : 'border-zinc-800/50 opacity-60 cursor-default'}
                            `}
                        />
                        <datalist id="turnes-ciudades-biz">
                            {CIUDADES_PRINCIPALES.map(ciudad => (
                                <option key={ciudad} value={ciudad} />
                            ))}
                        </datalist>
                    </div>
                    {isEditing && formData.lat && (
                        <p className="text-xs text-emerald-500/80 mt-1 px-1 flex items-center gap-1">
                            <MapPin size={10} />
                            Coords: {Number(formData.lat).toFixed(4)}, {Number(formData.lng).toFixed(4)}
                        </p>
                    )}
                    {isEditing && !formData.lat && formData.address && (
                        <p className="text-xs text-amber-500/80 mt-1 px-1">
                            Ciudad no reconocida — selecciona del listado para activar el match geográfico.
                        </p>
                    )}
                </div>

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
