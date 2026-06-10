import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import CookieSettingsModal from './CookieSettingsModal';

import { useState } from 'react';
import { useCookieConsent } from '../../../hooks/useCookieConsent';

/**
 * 🛡️ CookieTrigger (Privacy Persistence)
 * 
 * Botón flotante persistente que permite re-abrir las configuraciones de privacidad.
 * Se integra con el sistema de consentimiento global.
 */
export const CookieTrigger = () => {
    const { hasConsented } = useCookieConsent();
    const [isOpen, setIsOpen] = useState(false);

    // Solo mostramos el trigger si el usuario ya tomó una decisión (el banner se fue)
    if (!hasConsented) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-6 left-6 z-[9998]"
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center text-zinc-600 hover:text-emerald-500 hover:bg-zinc-900 hover:border-emerald-500/20 transition-all shadow-xl group"
                    title="Configuración de Privacidad"
                >
                    <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                    
                    {/* Tooltip Minimalista */}
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-black border border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Privacidad</p>
                    </div>
                </button>
            </motion.div>

            <CookieSettingsModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
            />
        </>
    );
};

export default CookieTrigger;
