import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Sparkles, LogOut, Briefcase } from 'lucide-react';
import { SectionCard, InputField } from '../../components/profile/SharedComponents';

const WorkerProfileForm = ({
    formData,
    handleInputChange,
    handleSectorChange,
    handleSkillToggle,
    isEditing,
    setIsEditing,
    loading,
    handleSave,
    handleCancel,
    logout,
    sectors,       // List of [key, data]
    currentSectorData // Resolved data for selected sector
}) => {

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
        >
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <SectionCard title="Información Personal" icon={<User size={14} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        label="Teléfono Móvil"
                        value={formData.phone}
                        onChange={v => handleInputChange('phone', v)}
                        disabled={!isEditing}
                        icon={<Phone size={12} />}
                    />
                    <InputField
                        label="Ubicación Base"
                        value={formData.location}
                        onChange={v => handleInputChange('location', v)}
                        disabled={!isEditing}
                        icon={<MapPin size={12} />}
                    />
                    <InputField
                        label="Bio / Presentación"
                        value={formData.bio}
                        onChange={v => handleInputChange('bio', v)}
                        disabled={!isEditing}
                        fullWidth
                        placeholder="Ej: Tengo 3 años de experiencia en servicio al cliente..."
                    />
                </div>
            </SectionCard>

            {/* SECCIÓN 2: ESPECIALIDAD (TAXONOMÍA) */}
            <SectionCard title="Especialidad y Habilidades" icon={<Briefcase size={14} />}>
                <div className="space-y-4">
                    {/* Selector de Sector Principal */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider pl-1">
                            ¿En qué sector te especializas?
                        </label>
                        <select
                            className="w-full bg-zinc-900/30 border border-zinc-700 rounded-lg py-2 px-3 text-xs text-zinc-300 outline-none focus:border-purple-500 disabled:opacity-50"
                            value={formData.sector}
                            onChange={(e) => handleSectorChange(e.target.value)}
                            disabled={!isEditing}
                        >
                            <option value="">Selecciona tu área principal...</option>
                            {sectors.map(([key, data]) => (
                                <option key={key} value={key}>{data.label}</option>
                            ))}
                        </select>
                        {currentSectorData && (
                            <p className="text-[9px] text-zinc-500 pl-1 italic">
                                {currentSectorData.description}
                            </p>
                        )}
                    </div>

                    {/* CHECKBOXES DINÁMICOS (Si hay sector seleccionado) */}
                    {currentSectorData && (
                        <div className="bg-zinc-950 rounded-xl p-3 border border-white/20 shadow-inner animate-in fade-in slide-in-from-top-2">
                            <label className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-3 block flex items-center gap-1">
                                <Sparkles size={10} /> Selecciona tus Roles y Habilidades
                            </label>

                            {/* GRUPO 1: ROLES (Cargos) */}
                            <div className="mb-3">
                                <span className="text-[9px] text-zinc-500 font-bold mb-1 block">ROLES / CARGOS</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {currentSectorData.roles.map(role => {
                                        const isSelected = (formData.skills || []).includes(role.label);
                                        return (
                                            <label
                                                key={role.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-transparent border-transparent hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => isEditing && handleSkillToggle(role.label)}
                                                    disabled={!isEditing}
                                                    className="w-3 h-3 rounded border-zinc-600 bg-zinc-900 text-purple-600 focus:ring-purple-500 focus:ring-1"
                                                />
                                                <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                                    {role.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* GRUPO 2: SKILLS (Certificados/Hard Skills) */}
                            <div>
                                <span className="text-[9px] text-zinc-500 font-bold mb-1 block">CERTIFICADOS Y HABILIDADES</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {currentSectorData.skills.map(skill => {
                                        const isSelected = (formData.skills || []).includes(skill.label);
                                        return (
                                            <label
                                                key={skill.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-zinc-800'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => isEditing && handleSkillToggle(skill.label)}
                                                    disabled={!isEditing}
                                                    className="w-3 h-3 rounded border-zinc-600 bg-zinc-900 text-emerald-600 focus:ring-emerald-500 focus:ring-1"
                                                />
                                                <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                                    {skill.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* ACTION BUTTONS (MÓVIL STICKY & DESKTOP) */}
            {/* Reutilizando diseño exacto del perfil empresa */}
            <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 flex gap-2">
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
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden group"
                    >
                        <Edit2 size={12} className="relative z-10" /> <span className="relative z-10">Editar Información</span>
                    </button>
                )}
            </div>

            {/* LOGOUT BUTTON */}
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

export default WorkerProfileForm;
