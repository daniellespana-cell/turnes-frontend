import React, { useState } from 'react';
import { User, Check, Shield, Lock, X, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🧠 CONEXIÓN CEREBRO (Hook Logic)
import { useProfileLogic } from '../../hooks/useProfileLogic';

// Componentes Refactorizados
import ProfileHeader from '../../components/profile/ProfileHeader';
import WalletCard from '../../components/profile/WalletCard';
import ProfileForm from '../../components/profile/ProfileForm';
import { StatCard } from '../../components/profile/SharedComponents';

import VerificationBanner from '../../components/profile/VerificationBanner';

const ProfilePage = () => {
    // Extracción de lógica del Hook
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

    // Estado Local para Modal de Contraseña
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            alert("Las contraseñas no coinciden");
            return;
        }
        const success = await handleChangePassword(passData.old, passData.new);
        if (success) {
            setPasswordModalOpen(false);
            setPassData({ old: '', new: '', confirm: '' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 md:px-8 pt-6">

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

            {/* --- BANNER VERIFICACIÓN ELITE (COMMERCIAL) --- */}
            <div className="mb-8">
                <VerificationBanner />
            </div>

            {/* --- GRID PRINCIPAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA: BILLETERA Y STATS */}
                <div className="space-y-6">

                    {/* Tarjeta de Billetera (Updated Style) */}
                    <WalletCard
                        saldo={user?.saldo}
                        onRecharge={navigateToRecharge}
                    />

                    {/* Stats Rápidos */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            label="Turnos"
                            value={stats.turnos}
                            icon={<Check size={14} />}
                        />
                        <StatCard
                            label="Rating"
                            value={stats.rating}
                            icon={<User size={14} />}
                        />
                    </div>

                    {/* Seguridad */}
                    <div className="hidden lg:block p-6 rounded-3xl bg-[#09090b] border border-white/5">
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

                {/* COLUMNA DERECHA: FORMULARIO */}
                <ProfileForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSkillToggle={handleSkillToggle} // <-- Skills Logic
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    loading={loading}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    logout={logout}
                />
            </div>

            {/* --- MODAL CAMBIO CONTRASÉÑA --- */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setPasswordModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-3xl shadow-2xl z-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <KeyRound size={20} className="text-purple-500" /> Cambiar Contraseña
                                </h3>
                                <button onClick={() => setPasswordModalOpen(false)} className="text-zinc-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={submitPasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        value={passData.old}
                                        onChange={e => setPassData({ ...passData, old: e.target.value })}
                                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passData.new}
                                        onChange={e => setPassData({ ...passData, new: e.target.value })}
                                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Confirmar Nueva</label>
                                    <input
                                        type="password"
                                        value={passData.confirm}
                                        onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Actualizando...' : 'Confirmar Cambio'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;