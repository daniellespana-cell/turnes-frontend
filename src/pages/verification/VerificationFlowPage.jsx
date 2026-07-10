import { m as motion } from 'framer-motion';
import VerificationDocUpload from '../../components/verification/VerificationDocUpload';

import React, { useState } from 'react';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VerificationService } from '../../services/verificationService';
import { logger } from '../../utils/logger';

/**
 * 🛡️ VERIFICATION FLOW PAGE
 * Orquesta el flujo de 3 pasos post-pago para la Verificación Elite.
 * Paso 1: Pago (en PlanActionPage)
 * Paso 2: Upload de documentos (este componente)
 * Paso 3: Confirmación (en revisión)
 */
const VerificationFlowPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState('upload'); // 'upload' | 'success' | 'checking' | 'blocked'

    // SSOT: Real-time synchronization with the verification state
    React.useEffect(() => {
        if (!user?.id) return;
        
        const checkStatus = async () => {
            const { data, error } = await VerificationService.getMyRequest();
            
            if (error) {
                setStep('blocked');
                return;
            }

            // Si no hay datos, es que el pago aún no se ha reflejado en la tabla de solicitudes
            if (!data) {
                setStep('checking');
                return;
            }

            switch (data.status) {
                case 'payment_cleared':
                    setStep('upload');
                    break;
                case 'pending':
                case 'in_review':
                    setStep('success');
                    break;
                case 'approved':
                    navigate('/dashboard');
                    break;
                case 'rejected':
                    setStep('blocked');
                    break;
                default:
                    setStep('blocked');
            }
        };

        // Initial check
        checkStatus();

        // 🛡️ REAL-TIME SUBSCRIPTION (Senior Pattern - Clean Architecture)
        const channel = VerificationService.subscribeToRequestStatus(user.id, () => {
            logger.info('⚡ Verification state updated in real-time');
            checkStatus();
        });

        return () => {
            VerificationService.unsubscribe(channel);
        };
    }, [user?.id, navigate]);

    if (step === 'checking') {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md space-y-8"
                >
                    <div className="relative">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                            <Clock size={32} className="text-blue-400 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full border-t-blue-500 animate-spin" />
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Confirmando Pago</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                            Estamos esperando la confirmación de la red bancaria (Wompi). 
                            <span className="text-blue-400 block mt-1">No cierres esta ventana.</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            Sincronización en tiempo real activa
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (step === 'blocked') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="max-w-md space-y-8">
                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Shield size={48} className="text-red-400" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Acceso Restringido
                        </h1>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Tu solicitud de verificación no está activa o el pago fue rechazado. 
                            Si crees que esto es un error, intenta recargar o contacta a soporte.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full h-13 py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 active:scale-95 transition-all"
                            type="button"
                            aria-label="Acción">
                            Reintentar Validación
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full h-13 py-4 rounded-2xl bg-white/5 text-zinc-500 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all"
                            type="button"
                            aria-label="Acción">
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (step === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="max-w-md space-y-8">
                    {/* Animated Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto"
                    >
                        <Shield size={48} className="text-blue-400" />
                    </motion.div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Solicitud Enviada
                        </h1>
                        <p className="text-zinc-400 leading-relaxed">
                            Tu documentación está siendo revisada por el equipo de Turnes.
                            Recibirás una notificación con el resultado en <strong className="text-white">24–48 horas</strong>.
                        </p>
                    </div>

                    {/* Steps timeline */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4 text-left">
                        {[
                            { icon: CheckCircle, label: 'Pago procesado', color: 'text-emerald-400', done: true },
                            { icon: CheckCircle, label: 'Documentos enviados', color: 'text-emerald-400', done: true },
                            { icon: Clock, label: 'En revisión por el equipo de Turnes', color: 'text-amber-400', done: false },
                            { icon: Shield, label: 'Badge de verificación activado', color: 'text-zinc-600', done: false }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <item.icon size={16} className={item.color} />
                                <span className={`text-sm font-medium ${item.done ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-13 py-4 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-200 active:scale-95 transition-all"
                        type="button"
                        aria-label="Acción">
                        Volver al Dashboard
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060606] py-16 px-6">
            {/* Progress Bar */}
            <div className="max-w-lg mx-auto mb-12">
                <div className="flex items-center gap-3 mb-2">
                    {['Pago', 'Documentos', 'En Revisión'].map((label, i) => (
                        <React.Fragment key={label}>
                            <div className={`flex items-center gap-2 ${i === 1 ? 'text-white' : 'text-zinc-600'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
                                    ${i === 0 ? 'bg-emerald-500 text-black' :
                                      i === 1 ? 'bg-blue-500 text-white' :
                                      'bg-zinc-800 text-zinc-600'}`}>
                                    {i === 0 ? '✓' : i + 1}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-px ${i === 0 ? 'bg-emerald-500/30' : 'bg-zinc-800'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <VerificationDocUpload onSuccess={() => setStep('success')} />
        </div>
    );
};

export default VerificationFlowPage;
