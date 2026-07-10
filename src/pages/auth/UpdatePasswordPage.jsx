import React from 'react';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import TurnesButton from '../../components/ui/TurnesButton';
import AuthBackground from '../../components/ui/auth/AuthBackground';
import PasswordInput from '../../components/ui/auth/PasswordInput';

import { useUpdatePassword } from '../../hooks/auth/useUpdatePassword';

const UpdatePasswordPage = () => {
    const {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        togglePasswordVisibility,
        isLoading,
        error,
        isSuccess,
        handleSubmit
    } = useUpdatePassword();

    return (
        <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">
            <AuthBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-[360px] relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-transparent flex items-center justify-center  shadow-emerald-500/10"
                    >
                        <Lock size={20} className="text-emerald-400" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Nueva Contraseña</h1>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                        Crea una clave segura para proteger tu cuenta en Turnes.
                    </p>
                </div>

                {/* Form Area */}
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.form
                            key="update-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <PasswordInput
                                id="new-password"
                                label="Nueva Contraseña"
                                placeholder="Nueva Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                showPassword={showPassword}
                                onToggleVisibility={togglePasswordVisibility}
                            />

                            <PasswordInput
                                id="confirm-password"
                                label="Confirmar Contraseña"
                                placeholder="Confirmar Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                showPassword={showPassword}
                            // No pass onToggleVisibility here so we only show the eye on the first input, or pass it if desired
                            />

                            <TurnesButton
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full !py-3.5 !rounded-xl !text-sm !font-semibold mt-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40"
                            >
                                Actualizar Contraseña
                            </TurnesButton>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center backdrop-blur-sm"
                        >
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mx-auto mb-3">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-white font-semibold mb-1">¡Contraseña Actualizada!</h3>
                            <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                                Ya puedes usar tu nueva clave. Te estamos redirigiendo...
                            </p>
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-red-200 text-xs"
                        >
                            <AlertCircle size={14} className="flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default UpdatePasswordPage;
