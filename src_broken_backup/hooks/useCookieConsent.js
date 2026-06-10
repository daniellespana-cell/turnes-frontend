import { useState, useEffect, useCallback } from 'react';

/**
 * 🍪 useCookieConsent (Senior Pattern)
 * 
 * Gestiona el ciclo de vida del consentimiento de cookies.
 * - Persistencia en LocalStorage.
 * - Categorías granulares: essential, analytics, marketing.
 * - Expira después de 180 días.
 */

const STORAGE_KEY = 'turnes_cookie_preferences';
const EXPIRATION_DAYS = 180;

export const useCookieConsent = () => {
    const [preferences, setPreferences] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    // 1. Cargar preferencias al montar
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const now = new Date().getTime();
                
                // Verificar si ha expirado
                if (parsed.expiry && now > parsed.expiry) {
                    localStorage.removeItem(STORAGE_KEY);
                    setShowBanner(true);
                } else {
                    setPreferences(parsed.data);
                    setShowBanner(false);
                }
            } catch (e) {
                console.error("Error parsing cookie preferences", e);
                setShowBanner(true);
            }
        } else {
            setShowBanner(true);
        }
    }, []);

    // 2. Guardar preferencias
    const saveConsent = useCallback((data) => {
        const expiry = new Date().getTime() + (EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
        const payload = {
            data,
            expiry,
            version: '1.0'
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setPreferences(data);
        setShowBanner(false);
        
        // Disparar evento para que otras partes de la app reaccionen (opcional)
        window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: data }));
    }, []);

    const acceptAll = () => {
        saveConsent({
            essential: true,
            analytics: true,
            marketing: true
        });
    };

    const declineAll = () => {
        saveConsent({
            essential: true,
            analytics: false,
            marketing: false
        });
    };

    return {
        preferences,
        showBanner,
        hasConsented: !!preferences,
        acceptAll,
        declineAll,
        saveConsent
    };
};
