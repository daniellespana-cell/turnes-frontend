import { useState, useEffect } from 'react';
import { useCookieConsent } from '../../../hooks/useCookieConsent';

/**
 * 🛠️ CookieSettingsModal
 * 
 * Modal granular para configurar preferencias de cookies.
 */
export const CookieSettingsModal = ({ isOpen, onClose }) => {
    const { preferences, saveConsent } = useCookieConsent();
    const [localPrefs, setLocalPrefs] = useState({
        essential: true,
        analytics: true,
        marketing: true
    });

    useEffect(() => {
        if (preferences) {
            setLocalPrefs(preferences);
        }
    }, [preferences, isOpen]);

    const handleSave = () => {
        saveConsent(localPrefs);
        onClose();
    };

    const toggle = (key) => {
        if (key === 'essential') return;
        setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex justify-end overflow-hidden">
                    {/* Backdrop Minimalista */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Side Panel (Ultra-Light & Fixed Width) */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-[320px] h-full bg-zinc-950/80 backdrop-blur-3xl border-l border-white/5 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 flex flex-col h-full">
                            {/* Header Slim */}
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Privacidad</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Configuración</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-zinc-600 hover:text-white transition-all">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                {/* Essential */}
                                <CookieOption 
                                    icon={<Shield size={14} />}
                                    title="Esenciales"
                                    description="Seguridad y sesión."
                                    checked={true}
                                    disabled={true}
                                    onChange={() => {}}
                                />

                                {/* Analytics */}
                                <CookieOption 
                                    icon={<BarChart3 size={14} />}
                                    title="Analíticas"
                                    description="Mejora de UX."
                                    checked={localPrefs.analytics}
                                    onChange={() => toggle('analytics')}
                                />

                                {/* Marketing */}
                                <CookieOption 
                                    icon={<Target size={14} />}
                                    title="Marketing"
                                    description="Ofertas relevantes."
                                    checked={localPrefs.marketing}
                                    onChange={() => toggle('marketing')}
                                />
                            </div>

                            {/* Footer Minimal */}
                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-white text-black font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const CookieOption = ({ icon, title, description, checked, onChange, disabled = false }) => (
    <div 
        onClick={!disabled ? onChange : undefined}
        className={`group cursor-pointer transition-all ${disabled ? 'opacity-50' : 'hover:translate-x-1'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${checked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-zinc-600'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="text-[11px] font-black text-zinc-200 uppercase tracking-tighter">{title}</h4>
                <p className="text-[9px] text-zinc-500 font-medium leading-none">{description}</p>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-800 bg-zinc-900/50'
            }`}>
                {checked && <Check size={12} className="text-black stroke-[4px]" />}
            </div>
        </div>
    </div>
);
