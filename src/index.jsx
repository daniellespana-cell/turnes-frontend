import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './config/sentry.config';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';

import './index.css';
import 'leaflet/dist/leaflet.css';

// 🚀 Inicializar Sentinel Error Tracking (Sentry)
initSentry();

// 🚀 Registrar Service Worker (Requerido para PWA y Push Notifications)
import { registerSW } from 'virtual:pwa-register';
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);