import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { versionService } from '../../services/versionService';

export const AppUpdateToast = () => {
    const [hasUpdate, setHasUpdate] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const unsubscribe = versionService.subscribe((updateAvailable) => {
            setHasUpdate(updateAvailable);
        });

        return () => unsubscribe();
    }, []);

    const handleApply = () => {
        setIsUpdating(true);
        versionService.applyUpdate();
    };

    const handleDismiss = () => {
        setIsDismissed(true);
    };

    if (!hasUpdate || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                id="pwa-update-toast"
                role="alert"
                aria-live="polite"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                className="fixed bottom-5 right-5 z-[99999] max-w-sm w-full mx-auto px-4 md:px-0"
            >
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Sparkles size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-xs tracking-wide">
                                Nueva Versión Lista
                            </h4>
                            <p className="text-zinc-400 text-[11px] leading-snug">
                                Turnes se ha optimizado. Actualiza para aplicar mejoras.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            id="btn-apply-app-update"
                            name="applyAppUpdate"
                            type="button"
                            onClick={handleApply}
                            disabled={isUpdating}
                            aria-label="Actualizar Turnes ahora"
                            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} />
                            {isUpdating ? 'Aplicando...' : 'Actualizar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label="Cerrar aviso de actualización"
                            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AppUpdateToast;
