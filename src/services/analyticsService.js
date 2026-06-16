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
        this.gaId = import.meta.env.VITE_GA_ID;
    }

    init() {
        if (this.isInitialized) return;
        
        // Inicialización de Google Analytics (gtag.js) si está configurado en .env
        if (this.gaId) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', this.gaId, { send_page_view: false });
            
            console.info(`[Analytics] GA Inicializado con ID: ${this.gaId}`);
        } else {
            console.warn('[Analytics] Modo Mock: VITE_GA_ID no configurado en variables de entorno.');
        }
        
        this.isInitialized = true;
    }

    /**
     * Rastrea una vista de página
     * @param {string} path - La ruta de la página (ej: '/explorar')
     */
    trackPageView(path) {
        if (!this.isInitialized) this.init();
        
        if (this.gaId && window.gtag) {
            window.gtag('event', 'page_view', { page_path: path });
        }
        console.info(`[Analytics] PageView: ${path}`);
    }

    /**
     * Rastrea un evento específico del negocio
     * @param {string} eventName - Nombre del evento en snake_case
     * @param {object} properties - Metadatos adicionales
     */
    trackEvent(eventName, properties = {}) {
        if (!this.isInitialized) this.init();
        
        if (this.gaId && window.gtag) {
            window.gtag('event', eventName, properties);
        }
        console.info(`[Analytics] Event: ${eventName}`, properties);
    }

    /**
     * Identifica a un usuario cuando hace login
     * @param {string} userId - ID único del usuario
     * @param {object} traits - Email, nombre, rol
     */
    identifyUser(userId, traits = {}) {
        if (!this.isInitialized) this.init();
        
        if (this.gaId && window.gtag) {
            // En Google Analytics 4, se envía el user_id configurando la propiedad a nivel global
            window.gtag('config', this.gaId, { user_id: userId });
            
            // Y se envían los user properties (traits) 
            if (Object.keys(traits).length > 0) {
                window.gtag('set', 'user_properties', traits);
            }
        }
        console.info(`[Analytics] User Identified: ${userId}`, traits);
    }
}

// Exportamos un Singleton para que haya una única instancia en toda la App
export const analyticsService = new AnalyticsService();
