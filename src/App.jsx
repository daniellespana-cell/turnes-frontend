import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationsProvider } from './context/NotificationsContext';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import GlobalNotifier from './components/common/GlobalNotifier';

import { useEffect } from 'react';

// Config & Services
import { syncTaxonomyWithDB } from './domain/vacantes.taxonomy';
import { router } from './router';

// Providers

// Components

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching jitter on tab switch
      retry: 1, // Only retry once to avoid spamming the DB
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