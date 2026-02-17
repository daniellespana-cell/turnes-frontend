import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import TurnesButton from '../components/ui/TurnesButton';

const UpdatePasswordPage = () => {
    const navigate = useNavigate();

    // Estados locales para el formulario
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validar sesión al cargar (Seguridad extra)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Si no hay sesión (el link expiró o es inválido), volver al login
                // navigate('/login'); 
                // Comentado para permitir debug si supabase tarda en hidratar la sesión
            }
        };
        checkSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Validaciones básicas
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. Llamada a Supabase para actualizar el usuario
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // 3. Éxito
            setIsSuccess(true);

            // Redirigir automáticamente después de 3 segundos
            setTimeout(() => {
                navigate('/'); // O al Dashboard
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error al actualizar la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">

            {/* --- ALIVE BACKGROUND (Igual al anterior para consistencia) --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] right-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-30%] left-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* --- CORE INTERFACE --- */}
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
                        className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl shadow-emerald-500/10"
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
                            {/* Input Password */}
                            <div className="group relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="peer w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-text hover:bg-zinc-900/80 pr-10"
                                    placeholder="Nueva Contraseña"
                                    id="new-password"
                                />
                                <label
                                    htmlFor="new-password"
                                    className="absolute left-4 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-500"
                                >
                                    Nueva Contraseña
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Input Confirm Password */}
                            <div className="group relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="peer w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-text hover:bg-zinc-900/80"
                                    placeholder="Confirmar Contraseña"
                                    id="confirm-password"
                                />
                                <label
                                    htmlFor="confirm-password"
                                    className="absolute left-4 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-500"
                                >
                                    Confirmar Contraseña
                                </label>
                            </div>

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
