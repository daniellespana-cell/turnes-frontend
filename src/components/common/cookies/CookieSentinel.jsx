import { useEffect } from 'react';
import { useCookieConsent } from '../../../hooks/useCookieConsent';
import { logger } from '../../../utils/logger';

/**
 * 🛡️ CookieSentinel (Senior Orchestrator)
 * 
 * Este componente no renderiza nada. Su ÚNICA responsabilidad es 
 * reaccionar a los cambios de consentimiento e inyectar/remover scripts.
 */
export const CookieSentinel = () => {
    const { preferences } = useCookieConsent();

    useEffect(() => {
        if (!preferences) return;

        // 📊 ANALYTICS: Google Analytics / GTM
        if (preferences.analytics) {
            logger.info("🛡️ [Sentinel] Activating Analytics...");
            // loadExternalScript('ga-script', 'https://www.googletagmanager.com/gtag/js?id=YOUR_ID');
        }

        // 🎯 MARKETING: Meta Pixel / Ads
        if (preferences.marketing) {
            logger.info("🛡️ [Sentinel] Activating Marketing Pixels...");
            // loadExternalScript('meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
        }

    }, [preferences]);

    return null;
};

/**
 * 🛠️ Script Loader Helper
 * Encapsula la lógica de inyección para evitar duplicados y errores de DOM.
 */
export const loadExternalScript = (id, src) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
};

export default CookieSentinel;
