import { useState } from 'react';
import { PATHS } from '../../../config/routes.paths';
import { useCookieConsent } from '../../../hooks/useCookieConsent';

/**
 * 🍪 CookieBanner (Premium Aesthetics)
 * 
 * Banner global de consentimiento con diseño Zero-Border y Glassmorphism.
 */
export const CookieBanner = () => {
    const { showBanner, acceptAll } = useCookieConsent();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-full px-6 py-4 md:py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
                                
                                {/* Contenido Izquierdo: Icono + Texto */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                        <Cookie className="text-zinc-400" size={20} />
                                    </div>
                                    <p className="text-[13px] text-zinc-300 leading-relaxed font-medium">
                                        Utilizamos cookies para mejorar tu experiencia y personalizar el contenido. Al navegar, aceptas nuestra 
                                        <Link 
                                            to={PATHS.PUBLIC.LEGAL.COOKIES} 
                                            className="ml-1.5 text-white font-black hover:underline underline-offset-4 decoration-emerald-500/50"
                                        >
                                            Política de cookies
                                        </Link>.
                                    </p>
                                </div>

                                {/* Acciones Derecha */}
                                <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                                    <button 
                                        onClick={() => setShowSettings(true)}
                                        className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-all active:scale-95"
                                    >
                                        Gestionar
                                    </button>
                                    <button
                                        onClick={acceptAll}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
                                    >
                                        Aceptar todas
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CookieSettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
            />
        </>
    );
};
