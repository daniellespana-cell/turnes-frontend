import React from 'react';
import { User, Check, Shield, Lock } from 'lucide-react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import WalletCard from '../../components/profile/WalletCard';
import ProfileForm from '../../components/profile/ProfileForm';
import StatCard from '../../components/profile/shared/StatCard';
import VerificationBanner from '../../components/profile/VerificationBanner';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import GlowDivider from '../../components/common/GlowDivider';

import { useState } from 'react';

// 🧠 CONEXIÓN CEREBRO (Hook Logic)
import { useProfileLogic } from '../../hooks/useProfileLogic';

// Componentes Refactorizados


const ProfilePage = () => {
    const {
        user,
        formData,
        stats,
        isEditing,
        loading,
        setIsEditing,
        handleInputChange,
        handleSkillToggle,
        handleChangePassword,
        handleSave,
        handleCancel,
        navigateToRecharge,
        logout
    } = useProfileLogic();

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <div className="max-w-6xl mx-auto pb-32 px-4 md:px-8 pt-8 space-y-8">

            {/* --- HEADER HERO --- */}
            <ProfileHeader
                user={user}
                formData={formData}
                handleInputChange={handleInputChange}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSave={handleSave}
                handleCancel={handleCancel}
                loading={loading}
            />

            <GlowDivider />

            {/* --- BANNER VERIFICACIÓN ELITE --- */}
            <VerificationBanner />

            <GlowDivider />

            {/* --- GRID PRINCIPAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMNA IZQUIERDA: BILLETERA Y STATS (4/12) */}
                <div className="lg:col-span-4 space-y-8">

                    <WalletCard
                        saldo={user?.saldo}
                        onRecharge={navigateToRecharge}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            label="Turnos exitosos"
                            value={stats.turnos}
                            icon={<Check />}
                        />
                        <StatCard
                            label="Rating General"
                            value={stats.rating}
                            icon={<User />}
                        />
                    </div>

                    {/* Seguridad Card */}
                    <div className="glass-card p-6 md:p-8 space-y-6">
                        <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Shield size={20} className="text-emerald-400" /> 
                            Seguridad
                        </h3>
                        <button
                            onClick={() => setPasswordModalOpen(true)}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-xs md:text-sm font-black text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between px-6 group no-select"
                        >
                            <span>Cambiar Contraseña</span>
                            <Lock size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO (8/12) */}
                <div className="lg:col-span-8">
                    <ProfileForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSkillToggle={handleSkillToggle}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        loading={loading}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                        logout={logout}
                    />
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                onChangePassword={handleChangePassword}
                loading={loading}
            />
        </div>
    );
};

export default ProfilePage;
