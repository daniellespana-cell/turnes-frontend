import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './config/sentry.config';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';

import './index.css';

import { LazyMotion, domAnimation } from 'framer-motion';

import { registerSW } from 'virtual:pwa-register';
import { versionService } from './services/versionService';

// 🚀 Inicializar Sentinel Error Tracking (Sentry)
initSentry();

// 🚀 Inicializar Sentinel de Versionado y PWA Updates
versionService.init(registerSW);

// 🛡️ RECOVERY SENTINEL (Vite Preload / Chunk Mismatch tras despliegue)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    versionService.handleChunkError();
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <LazyMotion features={domAnimation} strict>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </LazyMotion>
    </GlobalErrorBoundary>
  </React.StrictMode>
);