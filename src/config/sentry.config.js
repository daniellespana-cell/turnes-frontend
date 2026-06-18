
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Solo inicializamos Sentry si estamos en Producción y existe el DSN.
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
  const isProduction = import.meta.env.PROD;

  if (isProduction && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        // 🚨 SE ELIMINÓ replayIntegration() PORQUE DESTRUYE EL RENDIMIENTO AL GUARDAR EL DOM EN SESSION STORAGE
      ],
      // Performance Monitoring
      tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
      tracePropagationTargets: ["localhost", /^https:\/\/turnes\.app/],
      // Session Replay (Apagado completamente por performance)
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      
      environment: "production",
      release: "turnes-vite@1.0.0",
    });
    console.info("[Sentinel] Sentry Error Tracking initialized.");
  }
};
