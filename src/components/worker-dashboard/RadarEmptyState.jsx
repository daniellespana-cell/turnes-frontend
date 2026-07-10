import React, { useState } from 'react';
import { Radar, Bell, Smartphone, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { authService } from '../../services/authService';
import { useWorkerStats } from '../../hooks/useWorkerStats';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * RadarEmptyState - Componente de Retención Inteligente
 * Reemplaza los estados vacíos tradicionales con Gamificación y Micro-Onboarding.
 */
const RadarEmptyState = () => {
    const { user, refreshUser } = useAuth();
    const { isSupported, permission, isSubscribed, subscribe, loading: pushLoading } = usePushNotifications();
    const { stats, loading: statsLoading } = useWorkerStats();
    const navigate = useNavigate();

    const [phone, setPhone] = useState(user?.telefono || '');
    const [savingPhone, setSavingPhone] = useState(false);

    // Derived State
    const hasPhone = Boolean(user?.telefono);
    const hasPush = isSubscribed || permission === 'granted'; // Consideramos granted como éxito si ya lo aceptó
    const profileCompletion = stats?.profileCompletion || 0;
    
    // MÁQUINA DE ESTADOS VISUAL
    let currentPhase = 'GAMIFICATION';
    if (isSupported && !hasPush && permission !== 'denied') {
        currentPhase = 'PUSH';
    } else if (!hasPhone) {
        currentPhase = 'PHONE';
    }

    const handleSavePhone = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 8) {
            toast.error("Ingresa un número de teléfono válido.");
            return;
        }

        setSavingPhone(true);
        try {
            await authService.updateProfile(user.id, { telefono: phone });
            await refreshUser();
            toast.success("¡Teléfono guardado! Te avisaremos por WhatsApp.");
        } catch (error) {
            console.error("Error saving phone:", error);
            toast.error("Error al guardar el teléfono.");
        } finally {
            setSavingPhone(false);
        }
    };

    return (
        <div className="w-full bg-zinc-900/40 rounded-3xl border border-emerald-500/10 p-6 md:p-8 relative overflow-hidden group">
            {/* Background effects */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Radar size={120} />
            </div>
            <div className="relative z-10 space-y-5 max-w-lg">
                
                {/* Header */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                        Radar de Talento Activado
                    </h3>
                </div>

                {/* Fase PUSH */}
                {currentPhase === 'PUSH' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">¡No te quedes en modo fantasma!</h4>
                            <p className="text-zinc-400 text-sm">
                                No hay vacantes ahora mismo, pero las empresas publican todo el tiempo. Activa las alertas para ser el primero en postularte.
                            </p>
                        </div>
                        <button
                            onClick={subscribe}
                            disabled={pushLoading}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                            type="button"
                            aria-label="Acción">
                            <Bell size={16} /> 
                            {pushLoading ? 'Activando...' : 'Activar Alertas Inmediatas'}
                        </button>
                    </div>
                )}

                {/* Fase PHONE */}
                {currentPhase === 'PHONE' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">Asegura tu lugar en la bolsa de talento</h4>
                            <p className="text-zinc-400 text-sm">
                                Déjanos tu número de WhatsApp. Cuando una empresa busque tu perfil, te escribiremos directo al móvil para que no pierdas la oportunidad.
                            </p>
                        </div>
                        <form onSubmit={handleSavePhone} className="flex gap-2">
                            <div className="relative flex-1">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input
                                    type="tel"
                                    placeholder="Tu número de WhatsApp"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={savingPhone || !phone}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                aria-label="Acción">
                                {savingPhone ? '...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Fase GAMIFICATION */}
                {currentPhase === 'GAMIFICATION' && (
                    <div className="space-y-4 animate-fade-in flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <h4 className="text-xl font-bold text-white">¡Estás en la lista prioritaria!</h4>
                            <p className="text-zinc-400 text-sm">
                                Las empresas invitan primero a los perfiles que están al 100%. Te avisaremos apenas publiquen un turno en tu zona.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/perfil')}
                                className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1 pt-2"
                                type="button"
                                aria-label="Acción">
                                Editar mi perfil →
                            </button>
                        </div>
                        
                        <div className="shrink-0 relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    className="text-zinc-800"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={251.2} // 2 * PI * 40
                                    strokeDashoffset={statsLoading ? 251.2 : 251.2 - (251.2 * profileCompletion) / 100}
                                    className={`transition-all duration-1000 ease-out ${profileCompletion === 100 ? 'text-emerald-400' : 'text-amber-400'}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {profileCompletion === 100 ? (
                                    <CheckCircle2 size={24} className="text-emerald-400" />
                                ) : (
                                    <span className="text-white font-bold text-lg">{statsLoading ? '-' : `${profileCompletion}%`}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert Denied Permission */}
                {permission === 'denied' && currentPhase !== 'PHONE' && currentPhase !== 'GAMIFICATION' && (
                    <div className="mt-4 flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300/80">
                            Bloqueaste las notificaciones en tu navegador. Tendrás que buscar turnos manualmente o habilitarlas en la configuración del sitio para que el Radar funcione.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadarEmptyState;
