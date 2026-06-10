/**
 * 📊 Analytics Service (Single Source of Truth)
 * 
 * Este servicio abstrae toda la lógica de rastreo. La UI NUNCA debe saber si estás
 * usando Google Analytics, PostHog, Meta Pixel o Mixpanel.
 * 
 * Uso en la UI:
 * import { analyticsService } from '@/services/analyticsService';
 * analyticsService.trackEvent('publicar_vacante_click', { userId: 123 });
 */

class AnalyticsService {
    constructor() {
        this.isInitialized = false;
        // Aquí podrías leer del .env si usas un ID de PostHog/Google
        // this.providerId = import.meta.env.VITE_ANALYTICS_ID;
    }

    init() {
        if (this.isInitialized) return;
        
        // 🚀 Inicialización de SDKs futuros (Ej: PostHog.init())
        // console.log('[Analytics] Sistema Inicializado');
        
        this.isInitialized = true;
    }

    /**
     * Rastrea una vista de página
     * @param {string} path - La ruta de la página (ej: '/explorar')
     */
    trackPageView(path) {
        if (!this.isInitialized) this.init();
        
        // 🌐 Implementación futura:
        // window.posthog?.capture('$pageview');
        // window.gtag?.('event', 'page_view', { page_path: path });
        
        console.info(`[Analytics] PageView: ${path}`);
    }

    /**
     * Rastrea un evento específico del negocio
     * @param {string} eventName - Nombre del evento en snake_case
     * @param {object} properties - Metadatos adicionales
     */
    trackEvent(eventName, properties = {}) {
        if (!this.isInitialized) this.init();
        
        // 🎯 Implementación futura:
        // window.posthog?.capture(eventName, properties);
        
        console.info(`[Analytics] Event: ${eventName}`, properties);
    }

    /**
     * Identifica a un usuario cuando hace login
     * @param {string} userId - ID único del usuario
     * @param {object} traits - Email, nombre, rol
     */
    identifyUser(userId, traits = {}) {
        if (!this.isInitialized) this.init();
        
        // 👤 Implementación futura:
        // window.posthog?.identify(userId, traits);
        
        console.info(`[Analytics] User Identified: ${userId}`, traits);
    }
}

// Exportamos un Singleton para que haya una única instancia en toda la App
export const analyticsService = new AnalyticsService();
