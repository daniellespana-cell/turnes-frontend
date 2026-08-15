
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
  const isProduction = import.meta.env.PROD;

  if (isProduction && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      // 📊 PERFORMANCE MONITORING
      tracesSampleRate: 0.2, // Samplea 20% de transacciones en producción
      tracePropagationTargets: ["localhost", /^https:\/\/turnes\.app/, /^https:\/\/.*\.supabase\.co/],
      
      environment: import.meta.env.MODE || "production",
      release: "turnes-vite@1.0.0",

      // 🛡️ FILTRADO SENIOR DE ERRORES RUIDOSOS O INOFENSIVOS
      beforeSend(event, hint) {
        const error = hint.originalException;
        if (error) {
          const errorMessage = typeof error === 'string' ? error : error.message || '';
          
          // 1. Ignorar cancelaciones intencionales de red (AbortError de fetch / Supabase hooks)
          if (error.name === 'AbortError' || errorMessage.includes('aborted')) {
            return null;
          }
          // 2. Ignorar interrupciones de red del usuario (pérdida temporal de conexión en móviles)
          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            return null;
          }
          // 3. Ignorar errores de extensiones de navegador de terceros
          if (event.exception?.values?.[0]?.stacktrace?.frames?.some(frame => frame.filename?.includes('chrome-extension://'))) {
            return null;
          }
        }
        return event;
      },
    });
    console.info("[Sentinel] Sentry Error Tracking con estándares Élite activado.");
  }
};

/**
 * 🔒 Método helper para vincular el contexto del usuario autenticado a Sentry sin exponer PII sensible
 */
export const setSentryUserContext = (user) => {
  if (user?.id) {
    Sentry.setUser({
      id: user.id,
      role: user.rol || user.role || 'desconocido'
    });
  } else {
    Sentry.setUser(null);
  }
};
