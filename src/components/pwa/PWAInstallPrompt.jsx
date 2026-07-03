import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isAppInstalled);
    if (isAppInstalled) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
    const isDebug = window.location.search.includes('pwa=1');

    // iOS: show native instructions guide
    if (isIosDevice) {
      setIsIOS(true);
      if (!hasDismissed || isDebug) {
        setTimeout(() => setShowPrompt(true), isDebug ? 1000 : 3000);
      }
    }

    // Android / Chrome: wire up the native install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!hasDismissed || isDebug) {
        setShowPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Debug mode: force show prompt even without native event
    if (isDebug && !isIosDevice) {
      setTimeout(() => setShowPrompt(true), 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] md:bottom-8 md:left-auto md:right-8 md:w-96"
      >
        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 rounded-2xl p-5 overflow-hidden relative">
          
          {/* Close Button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 rounded-full p-1.5"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 p-0.5 shadow-inner">
              <img src="/pwa-192x192.png" alt="Turnes App" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className="text-white font-bold text-base leading-tight">Instala Turnes</h3>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                Añade la app a tu inicio para un acceso más rápido y experiencia nativa.
              </p>
            </div>
          </div>

          {/* Action Buttons / Instructions */}
          <div className="mt-5">
            {isIOS ? (
              <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                <p className="text-xs text-zinc-300 flex flex-col gap-2.5">
                  <span className="flex items-center gap-2">
                    <span className="bg-zinc-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                    Toca el botón <Share size={14} className="text-emerald-400 mx-1" /> Compartir
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="bg-zinc-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                    Selecciona <PlusSquare size={14} className="text-zinc-400 mx-1" /> Agregar a Inicio
                  </span>
                </p>
              </div>
            ) : (
              <button 
                onClick={handleInstallClick}
                className="w-full bg-white text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all"
              >
                <Download size={16} />
                Instalar App Nativa
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
