import { useState } from 'react';

// Logic Hook
import { useWorkerProfileLogic } from '../../hooks/useWorkerProfileLogic';

// Reused Components

const WorkerProfile = () => {
    // Logic
    const {
        user,
        formData,
        stats,
        isEditing,
        loading,
        setIsEditing,
        handleInputChange,
        handleSectorChange,
        handleSkillToggle,
        handleSave,
        handleCancel,
        handleChangePassword,
        logout,
        sectors,
        currentSectorData
    } = useWorkerProfileLogic();

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 md:px-8 pt-6">

            {/* 1. HEADER HERO (Reused) */}
            <ProfileHeader
                user={user}
                formData={formData}
                handleInputChange={handleInputChange}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleSave={handleSave}
                loading={loading}
            />

            {/* 3. MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COL: FINANCES & STATS */}
                <div className="space-y-6">

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            label="Turnos"
                            value={stats.turnos}
                            icon={<Check size={14} />}
                        />
                        <StatCard
                            label="Rating"
                            value={stats.rating}
                            icon={<Star size={14} />}
                        />
                    </div>

                    {/* Security Access */}
                    <div className="hidden lg:block p-6 rounded-3xl bg-[#09090b] border border-transparent">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-500" /> Seguridad
                        </h3>
                        <button
                            onClick={() => setPasswordModalOpen(true)}
                            className="w-full py-3 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-between px-4 group"
                        >
                            Cambiar Contraseña
                            <Lock size={12} className="group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* RIGHT COL: WORKER FORM */}
                <WorkerProfileForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSectorChange={handleSectorChange}
                    handleSkillToggle={handleSkillToggle}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    loading={loading}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    logout={logout}
                    sectors={sectors}
                    currentSectorData={currentSectorData}
                />
            </div>

            {/* Modal Compartido de Cambio de Contraseña */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                onSubmit={handleChangePassword}
                isLoading={loading}
            />
        </div>
    );
};

export default WorkerProfile;
