
const IndustrialProfileSection = ({
    formData,
    handleSectorChange,
    handleSkillToggle,
    isEditing,
    sectors,
    currentSectorData
}) => {

    // Mapear sectores para el CustomSelect
    const sectorOptions = sectors.map(([key, data]) => ({
        value: key,
        label: data.label
    }));

    return (
        <SectionCard title="Especialidad y Habilidades" icon={<Briefcase size={14} />}>
            <div className="space-y-4">
                {/* Selector de Sector (Premium Custom Select) */}
                <CustomSelect
                    label="¿En qué sector te especializas?"
                    placeholder="Selecciona tu área principal..."
                    value={formData.sector}
                    options={sectorOptions}
                    onChange={handleSectorChange}
                    disabled={!isEditing}
                    icon={<Briefcase size={12} />}
                />

                {currentSectorData && (
                    <p className="text-[9px] text-zinc-500 pl-1 italic">
                        {currentSectorData.description}
                    </p>
                )}

                {/* Chips Interactivos (Emerald Theme for Workers) */}
                {currentSectorData && (
                    <div className="bg-zinc-950 rounded-xl p-3 border border-transparent shadow-inner">
                        <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-3 block flex items-center gap-1">
                            <Sparkles size={10} /> Selecciona tus Roles y Habilidades
                        </label>

                        {/* GRUPO 1: ROLES (Cargos) - Purple Tint for continuity but emerald check */}
                        <div className="mb-4">
                            <span className="text-[8px] text-zinc-600 font-bold mb-2 block uppercase tracking-widest">ROLES / CARGOS</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {currentSectorData.roles.map(role => {
                                    const isSelected = (formData.skills || []).includes(role.label);
                                    return (
                                        <motion.div
                                            key={role.id}
                                            whileHover={isEditing ? { scale: 1.02 } : {}}
                                            whileTap={isEditing ? { scale: 0.98 } : {}}
                                            onClick={() => isEditing && handleSkillToggle(role.label)}
                                            className={`
                                                relative flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group
                                                ${isSelected
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-zinc-900/40 border-white/5 '
                                                }
                                                ${!isEditing ? 'cursor-default opacity-80' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all
                                                ${isSelected ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-700 bg-zinc-800'}
                                            `}>
                                                {isSelected && <Check size={8} strokeWidth={4} className="text-black" />}
                                            </div>
                                            <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                                {role.label}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* GRUPO 2: SKILLS (Certificados) - Emerald Tint */}
                        <div>
                            <span className="text-[8px] text-zinc-600 font-bold mb-2 block uppercase tracking-widest">CERTIFICADOS Y HABILIDADES</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {currentSectorData.skills.map(skill => {
                                    const isSelected = (formData.skills || []).includes(skill.label);
                                    return (
                                        <motion.div
                                            key={skill.id}
                                            whileHover={isEditing ? { scale: 1.02 } : {}}
                                            whileTap={isEditing ? { scale: 0.98 } : {}}
                                            onClick={() => isEditing && handleSkillToggle(skill.label)}
                                            className={`
                                                relative flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group
                                                ${isSelected
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-zinc-900/40 border-white/5 '
                                                }
                                                ${!isEditing ? 'cursor-default opacity-80' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all
                                                ${isSelected ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-700 bg-zinc-800'}
                                            `}>
                                                {isSelected && <Check size={8} strokeWidth={4} className="text-black" />}
                                            </div>
                                            <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                                {skill.label}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SectionCard>
    );
};

export default IndustrialProfileSection;
