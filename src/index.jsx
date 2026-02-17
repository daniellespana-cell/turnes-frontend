import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext'; // <--- Nueva importación
import App from './App';
import './index.css';

// Importar Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar FontAwesome
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 💡 Senior Architecture:
        El ToastProvider se coloca dentro del AuthProvider. 
        Esto permite que, en el futuro, los mensajes puedan 
        depender del estado de autenticación si fuera necesario.
    */}
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);