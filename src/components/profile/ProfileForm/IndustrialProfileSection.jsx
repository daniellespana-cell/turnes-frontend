import React from 'react';
import { m as motion } from 'framer-motion';
import { Briefcase, Sparkles, Check } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import CustomSelect from '../shared/CustomSelect';

import { useState, useEffect } from 'react';
import { getCategoriasList, SECTOR_MAP } from '../../../domain/vacantes.taxonomy';

const IndustrialProfileSection = ({ formData, handleInputChange, handleSkillToggle, isEditing }) => {

    // Obtener lista de sectores (keys) para el selector
    const sectors = getCategoriasList().map(data => ({
        value: data.id,
        label: data.label
    }));

    // Estado local para el Sector seleccionado (Sincronizado)
    const [selectedSectorKey, setSelectedSectorKey] = useState(formData.sector || "");

    useEffect(() => {
        if (formData.sector) setSelectedSectorKey(formData.sector);
    }, [formData.sector]);

    const handleSectorChange = (sectorKey) => {
        setSelectedSectorKey(sectorKey);
        handleInputChange('sector', sectorKey);
    };

    // 🛡️ DEFENSE IN DEPTH: Eliminar duplicados que puedan venir de la Base de Datos
    const rawSkills = selectedSectorKey ? (SECTOR_MAP.get(selectedSectorKey)?.skills || []) : [];
    const currentSectorSkills = Array.from(new Map(rawSkills.map(skill => [skill.label, skill])).values());

    return (
        <SectionCard title="Perfil Industrial" icon={<Briefcase size={14} />}>
            <div className="space-y-4">
                {/* Selector de Sector (Premium Custom Select) */}
                <CustomSelect
                    label="Sector Económico"
                    placeholder="Seleccione su Sector Principal..."
                    value={selectedSectorKey}
                    options={sectors}
                    onChange={handleSectorChange}
                    disabled={!isEditing}
                    icon={<Briefcase size={12} />}
                />

                {selectedSectorKey && (
                    <p className="text-[9px] text-zinc-500 pl-1 italic">
                        {SECTOR_MAP.get(selectedSectorKey)?.description}
                    </p>
                )}

                {/* Chips de Habilidades Específicas */}
                {selectedSectorKey && (
                    <div className="bg-zinc-950 rounded-xl p-3 border border-white/20 shadow-inner">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                            <Sparkles size={10} /> Habilidades Clave del Sector
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {currentSectorSkills.map(skill => {
                                const isSelected = (formData.skills || []).includes(skill.label);
                                return (
                                    <motion.div
                                        key={skill.id}
                                        whileHover={isEditing ? { scale: 1.02 } : {}}
                                        whileTap={isEditing ? { scale: 0.98 } : {}}
                                        onClick={() => isEditing && handleSkillToggle(skill.label)}
                                        className={`
                                            relative flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                                            ${isSelected
                                                ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                                : 'bg-zinc-900/40 border-white/5 '
                                            }
                                            ${!isEditing ? 'cursor-default opacity-80' : ''}
                                        `}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={() => isEditing && handleSkillToggle(skill.label)}>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`
                                                w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all
                                                ${isSelected ? 'bg-purple-500 border-purple-400' : 'border-zinc-700 bg-zinc-800'}
                                            `}>
                                                {isSelected && <Check size={10} strokeWidth={4} className="text-white" />}
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                                {skill.label}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="sr-only"
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </SectionCard>
    );
};

export default IndustrialProfileSection;
