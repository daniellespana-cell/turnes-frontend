import { useEffect } from 'react';

// Config & Services
import { syncTaxonomyWithDB } from './domain/vacantes.taxonomy';
import { router } from './router';

// Providers

// Components

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
    <div className="App font-manrope antialiased bg-[#0a0a0a] min-h-screen">
      <GlobalErrorBoundary>
        <HelmetProvider>
          <NotificationsProvider>
            <Toaster richColors position="top-center" />
            <RouterProvider 
              router={router} 
              // Note: HydrateFallback is defined at route level in src/router/index.jsx
            />
          </NotificationsProvider>
        </HelmetProvider>
      </GlobalErrorBoundary>
    </div>
  );
}

export default App;