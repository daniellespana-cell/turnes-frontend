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
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
      tracePropagationTargets: ["localhost", /^https:\/\/turnes\.app/],
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
      
      environment: "production",
      release: "turnes-vite@1.0.0",
    });
    console.info("[Sentinel] Sentry Error Tracking initialized.");
  }
};
