import React from 'react';
import { m as motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import PersonalInfoSection from './ProfileForm/PersonalInfoSection';
import IndustrialProfileSection from './ProfileForm/IndustrialProfileSection';
import BillingInfoSection from './ProfileForm/BillingInfoSection';
import ProfileActionIsland from './ProfileForm/ProfileActionIsland';


// Sub-secciones Modulares

const ProfileForm = ({
    formData,
    handleInputChange,
    handleSkillToggle,
    isEditing,
    setIsEditing,
    loading,
    handleSave,
    handleCancel,
    logout
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

                {/* 2. SECCIÓN INDUSTRIAL (SECTOR + SKILLS) */}
                <IndustrialProfileSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSkillToggle={handleSkillToggle}
                    isEditing={isEditing}
                />

                {/* 3. SECCIÓN EMPRESA / FACTURACIÓN */}
                <BillingInfoSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                    isEditing={isEditing}
                />

                {/* BOTÓN LOGOUT */}
                <button
                    onClick={logout}
                    className="w-full mt-4 p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center gap-2 transition-all group"
                    type="button"
                    aria-label="Acción">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-wider">Cerrar Sesión</span>
                </button>
            </motion.div>
            {/* 4. ACCIÓN FLOTANTE */}
            <ProfileActionIsland
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loading={loading}
                handleSave={handleSave}
                handleCancel={handleCancel}
            />
        </>
    );
};

export default ProfileForm;
