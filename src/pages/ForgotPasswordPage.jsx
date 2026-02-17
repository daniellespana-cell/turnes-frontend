import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'; // Iconos más "vivos"
import { motion, AnimatePresence } from 'framer-motion';
import { useForgotPassword } from '../hooks/useForgotPassword'; // ✅ Separation of Concerns
import TurnesButton from '../components/ui/TurnesButton';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // Logic extracted to hook
    const {
        email,
        isLoading,
        message,
        isSent,
        handleEmailChange,
        submitRequest
    } = useForgotPassword();

    return (
        <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">

            {/* --- ALIVE BACKGROUND (Minimal & Organic) --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-30%] right-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
                {/* Subtle Grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* --- BACK NAVIGATION (Floating) --- */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/login')}
                className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all group z-20 text-xs font-medium tracking-wide uppercase"
            >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-zinc-400 group-hover:text-white" />
                </div>
                <span>Volver</span>
            </motion.button>

            {/* --- CORE INTERFACE --- */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-[360px] relative z-10"
            >

                {/* Header: Minimal & Direct */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl shadow-emerald-500/10"
                    >
                        <Sparkles size={20} className="text-emerald-400" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Recuperar Acceso</h1>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                        Ingresa tu email y te enviaremos un enlace mágico para entrar.
                    </p>
                </div>

                {/* Dynamic Form Area */}
                <AnimatePresence mode="wait">
                    {!isSent ? (
                        <motion.form
                            key="form-input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                            onSubmit={submitRequest}
                            className="flex flex-col gap-3"
                        >
                            <div className="group relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    className="peer w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-text hover:bg-zinc-900/80"
                                    placeholder="Email"
                                    id="recovery-email"
                                />
                                <label
                                    htmlFor="recovery-email"
                                    className="absolute left-4 top-1 text-xs text-zinc-500 transition-all 
                                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600
                                    peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-500"
                                >
                                    Email Corporativo
                                </label>
                            </div>

                            <TurnesButton
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full !py-3.5 !rounded-xl !text-sm !font-semibold mt-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40"
                            >
                                Enviar Enlace de Acceso
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
                            <h3 className="text-white font-semibold mb-1">¡Revisa tu correo!</h3>
                            <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                                Hemos enviado las instrucciones a <span className="text-white font-medium">{email}</span>.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wide"
                            >
                                Volver al Login
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Logic Visualization */}
                <AnimatePresence>
                    {message && message.type === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-red-200 text-xs"
                        >
                            <AlertCircle size={14} className="flex-shrink-0 text-red-500" />
                            <span>{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Brand */}
                <div className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
                        Turnes Security
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
