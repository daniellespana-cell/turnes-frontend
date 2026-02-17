import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Mail, Phone, MapPin, CreditCard, LogOut, Edit2, Sparkles, X, Briefcase } from 'lucide-react';
import { SectionCard, InputField } from './SharedComponents';
import { VACANTES_TAXONOMY } from '../../domain/vacantes.taxonomy';

const ProfileForm = ({ formData, handleInputChange, handleSkillToggle, isEditing, setIsEditing, loading, handleSave, handleCancel, logout }) => {

    // Obtener lista de sectores (keys) para el selector
    const sectors = Object.entries(VACANTES_TAXONOMY);

    // Estado local para el Sector seleccionado
    const [selectedSectorKey, setSelectedSectorKey] = useState("");

    // Detectar sector actual basado en skills (lógica reversa o manual)
    // Por simplicidad, asumimos que formData.sector se guarda o lo deducimos.
    // Si no existe, el usuario lo selecciona.

    const handleSectorChange = (sectorKey) => {
        setSelectedSectorKey(sectorKey);
        // Opcional: Podríamos limpiar las skills anteriores si cambia de sector radicalmente
        // Por ahora mantenemos la lógica flexible.
    };

    const currentSectorSkills = selectedSectorKey ? VACANTES_TAXONOMY[selectedSectorKey].skills : [];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4" // Espaciado reducido
        >
            {/* Sección Personal */}
            <SectionCard title="Información Personal" icon={<User size={14} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Gap reducido */}
                    <InputField
                        label="Nombre Completo"
                        value={formData.name}
                        onChange={v => handleInputChange('name', v)}
                        disabled={!isEditing}
                        icon={<User size={12} />}
                    />
                    <InputField
                        label="Correo Electrónico"
                        value={formData.email}
                        onChange={v => handleInputChange('email', v)}
                        disabled={!isEditing}
                        icon={<Mail size={12} />}
                    />
                    <InputField
                        label="Teléfono"
                        value={formData.phone}
                        onChange={v => handleInputChange('phone', v)}
                        disabled={!isEditing}
                        icon={<Phone size={12} />}
                    />
                    <InputField
                        label="Bio Corta"
                        value={formData.bio}
                        onChange={v => handleInputChange('bio', v)}
                        disabled={!isEditing}
                        fullWidth
                    />
                </div>
            </SectionCard>

            {/* SECCIÓN ESPECIAL: SECTOR Y HABILIDADES */}
            <SectionCard title="Perfil Industrial" icon={<Briefcase size={14} />}>
                <div className="space-y-4">
                    {/* Selector de Sector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider pl-1">
                            Sector Económico
                        </label>
                        <select
                            className="w-full bg-zinc-900/30 border border-zinc-700 rounded-lg py-2 px-3 text-xs text-zinc-300 outline-none focus:border-purple-500 disabled:opacity-50"
                            value={selectedSectorKey}
                            onChange={(e) => handleSectorChange(e.target.value)}
                            disabled={!isEditing}
                        >
                            <option value="">Seleccione su Sector Principal...</option>
                            {sectors.map(([key, data]) => (
                                <option key={key} value={key}>{data.label}</option>
                            ))}
                        </select>
                        {selectedSectorKey && (
                            <p className="text-[9px] text-zinc-500 pl-1 italic">
                                {VACANTES_TAXONOMY[selectedSectorKey].description}
                            </p>
                        )}
                    </div>

                    {/* Checkboxes de Habilidades Específicas */}
                    {selectedSectorKey && (
                        <div className="bg-zinc-950 rounded-xl p-3 border border-white/20 shadow-inner">
                            <label className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                <Sparkles size={10} /> Habilidades Clave del Sector
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {currentSectorSkills.map(skill => {
                                    // La taxonomía ahora retorna objetos { id, label }
                                    // Guardamos el LABEL para mantener consistencia visual
                                    const isSelected = (formData.skills || []).includes(skill.label);
                                    return (
                                        <label
                                            key={skill.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-transparent border-transparent hover:bg-zinc-800'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => isEditing && handleSkillToggle(skill.label)}
                                                disabled={!isEditing}
                                                className="w-3 h-3 rounded border-zinc-600 bg-zinc-900 text-purple-600 focus:ring-purple-500 focus:ring-1"
                                            />
                                            <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                                {skill.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>


            {/* Sección Empresa */}
            <SectionCard title="Datos de Facturación" icon={<Building2 size={14} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputField
                        label="Nombre de Empresa"
                        value={formData.company}
                        onChange={v => handleInputChange('company', v)}
                        disabled={!isEditing}
                        icon={<Building2 size={12} />}
                    />
                    <InputField
                        label="NIT / Identificación"
                        value={formData.nit}
                        onChange={v => handleInputChange('nit', v)}
                        disabled={!isEditing}
                        icon={<CreditCard size={12} />}
                    />
                    <InputField
                        label="Dirección Fiscal"
                        value={formData.address}
                        onChange={v => handleInputChange('address', v)}
                        disabled={!isEditing}
                        icon={<MapPin size={12} />}
                        fullWidth
                    />
                </div>
            </SectionCard>

            {/* Botones Móviles (Sticky Bottom) */}
            <div className="md:hidden fixed bottom-24 left-4 right-4 z-50 flex gap-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-xl font-bold text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white rounded-xl font-bold text-xs active:scale-95 transition-all relative overflow-hidden group"
                        >
                            <span className="relative z-10">{loading ? '...' : 'Guardar'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden group"
                    >
                        <Edit2 size={12} className="relative z-10" /> <span className="relative z-10">Editar Información</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
                    </button>
                )}
            </div>

            {/* Botón Logout */}
            <button
                onClick={logout}
                className="w-full mt-4 p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center gap-2 transition-all group"
            >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</span>
            </button>

        </motion.div>
    );
};

export default ProfileForm;
