import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationsProvider } from './context/NotificationsContext';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import GlobalNotifier from './components/common/GlobalNotifier';
import AppUpdateToast from './components/pwa/AppUpdateToast';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';

import { useEffect } from 'react';

// Config & Services
import { syncTaxonomyWithDB } from './domain/vacantes.taxonomy';
import { router } from './router';

// Providers

// Components

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with intelligent caching & resilience (Anti-Spam & Zero-Spinner UX)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // ⚡ 2 min: navigation feels instant, no re-fetching on tab back
      gcTime: 1000 * 60 * 10,   // 🧹 10 min: keep unmounted cache in memory
      retry: 2,                 // 🔄 2 retries with exponential backoff on flaky mobile networks
      refetchOnWindowFocus: false, // Prevent jitter on tab switch
    },
  },
});

/**
 * APP ENTRY POINT (Principal Solution - No Tech Debt)
 * - Static Router Injection
 * - Minimal side effects
 * - Clean provider hierarchy
 */
function App() {
  // Global boot logic
  useEffect(() => {
    // 🛡️ Difiere la sincronización 1 segundo para no competir por el 'Navigator Lock'
    // con el cliente de Supabase Auth en la inicialización (Evita Timeout en carga pesada / Strict Mode)
    const timeout = setTimeout(() => {
      syncTaxonomyWithDB();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App font-manrope antialiased bg-[#0a0a0a] min-h-screen w-full">
        <GlobalErrorBoundary>
          <HelmetProvider>
            <NotificationsProvider>
              <GlobalNotifier />
              <AppUpdateToast />
              <PWAInstallPrompt />
              <RouterProvider 
                router={router} 
              />
            </NotificationsProvider>
          </HelmetProvider>
        </GlobalErrorBoundary>
      </div>
    </QueryClientProvider>
  );
}

export default App;