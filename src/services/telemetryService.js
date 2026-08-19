/**
 * 🛰️ TELEMETRY SERVICE — Single Source of Truth para Observabilidad y Monitoreo (Turnes)
 *
 * Centraliza el rastreo de excepciones, logs de auditoría, contexto de usuario y
 * métricas operativas. Toda la UI y servicios delegan aquí en lugar de llamar
 * directamente a Sentry o SDKs externos.
 */

import * as Sentry from '@sentry/react';
import { logger } from '../utils/logger';

class TelemetryService {
    constructor() {
        this.isInitialized = false;
        this.userContext = null;
    }

    /**
     * Inicializa la telemetría global
     */
    init() {
        if (this.isInitialized) return;
        const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
        const isProduction = import.meta.env.PROD;

        if (isProduction && SENTRY_DSN) {
            Sentry.init({
                dsn: SENTRY_DSN,
                integrations: [
                    Sentry.browserTracingIntegration(),
                ],
                tracesSampleRate: 0.2, // Monitoreo del 20% de transacciones en prod
                tracePropagationTargets: [
                    'localhost',
                    /^https:\/\/turnes\.co/,
                    /^https:\/\/.*\.turnes\.co/,
                    /^https:\/\/turnes\.app/,
                    /^https:\/\/.*\.supabase\.co/
                ],
                environment: import.meta.env.MODE || 'production',
                release: 'turnes-vite@0.1.0',

                // 🛡️ Filtro y Sanitización de Errores Ruidosos
                beforeSend(event, hint) {
                    const error = hint.originalException;
                    if (error) {
                        const errorMessage = typeof error === 'string' ? error : error.message || '';

                        // 1. Ignorar cancelaciones de fetch intencionales (AbortController)
                        if (error.name === 'AbortError' || errorMessage.includes('aborted')) {
                            return null;
                        }
                        // 2. Ignorar cortes transitorios de red del usuario
                        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                            return null;
                        }
                        // 3. Ignorar errores de extensiones de navegador
                        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(frame => frame.filename?.includes('chrome-extension://'))) {
                            return null;
                        }
                    }
                    return event;
                }
            });
            logger.info('🛰️ [TelemetryService] Observabilidad en producción inicializada.');
        }
        this.isInitialized = true;
    }

    /**
     * Vincula el contexto del usuario autenticado sin exponer PII (email, teléfono, dirección)
     * @param {object} user - Objeto del usuario autenticado
     */
    setUser(user) {
        if (!user?.id) {
            this.clearUser();
            return;
        }

        this.userContext = {
            id: user.id,
            role: user.rol || user.role || 'candidato',
            plan: user.plan || 'Básico'
        };

        Sentry.setUser(this.userContext);
    }

    /**
     * Limpia la identidad del usuario al cerrar sesión
     */
    clearUser() {
        this.userContext = null;
        Sentry.setUser(null);
    }

    /**
     * Captura una excepción con metadatos contextuales y retorna el Event ID
     * @param {Error|string} error - Error capturado
     * @param {object} [context] - Contexto adicional (componentStack, tags, etc.)
     * @returns {string|null} Event ID de Sentry para soporte al usuario
     */
    captureException(error, context = {}) {
        logger.error('[TelemetryService] Excepción capturada:', error, context);

        try {
            return Sentry.captureException(error, {
                extra: context.extra || context,
                tags: context.tags || {},
                contexts: {
                    react: context.componentStack ? { componentStack: context.componentStack } : undefined,
                    operation: context.operation ? { name: context.operation } : undefined
                }
            });
        } catch {
            return null;
        }
    }

    /**
     * Captura un mensaje u advertencia operativa
     * @param {string} message - Mensaje a registrar
     * @param {'info'|'warning'|'error'} [level='info'] - Nivel de severidad
     * @param {object} [context] - Datos extra
     */
    captureMessage(message, level = 'info', context = {}) {
        logger.warn(`[TelemetryService] [${level.toUpperCase()}] ${message}`, context);

        try {
            Sentry.captureMessage(message, {
                level: level,
                extra: context
            });
        } catch {
            // Safe fallback
        }
    }

    /**
     * Agrega una miga de pan (Breadcrumb) en el historial de navegación del usuario
     * @param {string} category - Categoría (ej: 'auth', 'payment', 'chat')
     * @param {string} message - Acción realizada
     * @param {object} [data] - Datos no sensibles
     * @param {'info'|'warning'|'error'} [level='info']
     */
    addBreadcrumb(category, message, data = {}, level = 'info') {
        try {
            Sentry.addBreadcrumb({
                category,
                message,
                data,
                level,
                timestamp: Date.now() / 1000
            });
        } catch {
            // Safe fallback
        }
    }

    /**
     * Registra un hito de negocio para monitoreo de funnel
     * @param {string} eventName - Nombre del evento (ej: 'checkout_opened', 'video_started')
     * @param {object} [properties] - Propiedades del evento
     */
    trackEvent(eventName, properties = {}) {
        logger.dev(`📊 [Telemetry] Event: ${eventName}`, properties);
        this.addBreadcrumb('funnel', eventName, properties, 'info');
    }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
