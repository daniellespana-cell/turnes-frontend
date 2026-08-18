import React, { useState } from 'react';
import { Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateColombianPhone, formatPhoneInput } from '../../utils/validationUtils';

/**
 * WhatsAppOnboardingBanner — Componente Atómico & SSOT
 *
 * Responsabilidad Única:
 * - Solicitar y persistir el número de WhatsApp del postulante para la bolsa de turnos.
 * - Validación estricta bajo estándar móvil colombiano (10 dígitos iniciando por 3).
 * - Desaparecer permanentemente (return null) tan pronto `user.telefono` exista.
 * - Cero acoplamiento con listas de vacantes ni comunicación directa con la BD.
 */
const WhatsAppOnboardingBanner = () => {
    const { user, actualizarPerfil } = useAuth();
    const { showToast } = useToast();

    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);

    // 🔒 SSOT: Si el usuario ya tiene teléfono registrado, el componente se autodestruye del DOM
    if (user?.telefono) return null;

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneInput(e.target.value);
        setPhone(formatted);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const validation = validateColombianPhone(phone);
        if (!validation.isValid) {
            showToast(validation.error, 'error');
            return;
        }

        setSaving(true);
        try {
            // Guarda los dígitos limpios y normalizados (SSOT)
            await actualizarPerfil({ phone: validation.digits });
            showToast('¡WhatsApp guardado! Te avisaremos de nuevos turnos directamente.', 'success');
        } catch (error) {
            console.error('[WhatsAppBanner] Error guardando teléfono:', error);
            showToast('Error al guardar el teléfono. Intenta nuevamente.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section 
            aria-label="Registro de WhatsApp para alertas de turnos"
            className="w-full bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/20 rounded-3xl p-5 md:p-6 relative overflow-hidden backdrop-blur-md shadow-xl animate-fade-in"
        >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                
                {/* Texto descriptivo */}
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 w-fit">
                            <ShieldCheck size={12} className="text-emerald-400" /> Bolsa Prioritaria
                        </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        Asegura tu lugar en la bolsa de turnos
                    </h3>
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-xl">
                        Déjanos tu número de WhatsApp. Cuando una empresa busque tu perfil, te escribiremos directo al móvil para que no pierdas la oportunidad.
                    </p>
                </div>

                {/* Formulario de captura rápida */}
                <form 
                    onSubmit={handleSave}
                    className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto shrink-0"
                >
                    <div className="relative min-w-[220px] sm:min-w-[260px]">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                        <input
                            type="tel"
                            id="whatsapp-onboarding-input"
                            name="whatsapp"
                            placeholder="Ej: 310 123 4567"
                            value={phone}
                            onChange={handlePhoneChange}
                            maxLength={12}
                            disabled={saving}
                            className="w-full h-12 bg-black/60 border border-zinc-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 rounded-2xl pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 transition-all outline-none"
                            aria-label="Número de WhatsApp"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={saving || !phone.trim()}
                        className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Guardar número de WhatsApp"
                    >
                        {saving ? (
                            <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                Guardar
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

            </div>
        </section>
    );
};

export default WhatsAppOnboardingBanner;
