import React from 'react';
import { User, Mail, MapPin } from 'lucide-react';
import SectionCard from '../../profile/shared/SectionCard';
import InputField from '../../profile/shared/InputField';

import { CIUDADES_PRINCIPALES } from '../../../domain/geography.config';

/**
 * Sección de Información Personal del perfil del trabajador.
 *
 * "Ubicación Base" usa un combobox nativo (input + datalist) respaldado
 * por CIUDADES_PRINCIPALES del dominio geográfico de Turnes.
 * Esto garantiza:
 *   1. Texto predictivo sin dependencias externas
 *   2. Valor canónico al guardar (mismo que usan las vacantes en su `location`)
 *   3. Soporte correcto para el algoritmo de match geográfico
 */
const PersonalInfoSection = ({ formData, handleInputChange, isEditing }) => {
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

                {/* Ubicación Base — Combobox con taxonomía geográfica de Turnes */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-1.5">
                        <MapPin size={10} className="opacity-70" />
                        Ubicación Base
                    </label>
                    <div className="relative">
                        <input
                            id="location-combobox"
                            list="turnes-ciudades"
                            value={formData.location || ''}
                            onChange={e => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Ej: Bucaramanga"
                            autoComplete="off"
                            className={`
                                w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white
                                placeholder:text-zinc-700 outline-none transition-all duration-200
                                ${isEditing
                                    ? 'border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 cursor-text'
                                    : 'border-zinc-800/50 opacity-60 cursor-default'}
                            `}
                        />
                        <datalist id="turnes-ciudades">
                            {CIUDADES_PRINCIPALES.map(ciudad => (
                                <option key={ciudad} value={ciudad} />
                            ))}
                        </datalist>
                    </div>
                    {isEditing && (
                        <p className="text-[10px] text-zinc-600 mt-0.5 px-1">
                            Selecciona tu ciudad principal de trabajo para mejorar el match de vacantes.
                        </p>
                    )}
                </div>
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
