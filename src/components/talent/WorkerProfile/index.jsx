import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import PersonalInfoSection from './PersonalInfoSection';
import IndustrialProfileSection from './IndustrialProfileSection';
import WorkerActionIsland from './WorkerActionIsland';


// Secciones Modulares (KISS)

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
        <>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-4 pb-20 md:pb-0"
            >
                {/* 1. SECCIÓN PERSONAL */}
                <PersonalInfoSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                    isEditing={isEditing}
                />

                {/* 2. ESPECIALIDAD Y HABILIDADES (Chips Esmeralda) */}
                <IndustrialProfileSection
                    formData={formData}
                    handleSectorChange={handleSectorChange}
                    handleSkillToggle={handleSkillToggle}
                    isEditing={isEditing}
                    sectors={sectors}
                    currentSectorData={currentSectorData}
                />

                {/* BOTÓN LOGOUT */}
                <button
                    onClick={logout}
                    className="w-full mt-4 p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center gap-2 transition-all group"
                >
                    <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</span>
                </button>
            </motion.div>

            {/* 3. ACCIÓN FLOTANTE (DYNAMIC ISLAND ESMERALDA) */}
            <WorkerActionIsland
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loading={loading}
                handleSave={handleSave}
                handleCancel={handleCancel}
            />
        </>
    );
};

export default WorkerProfileForm;
