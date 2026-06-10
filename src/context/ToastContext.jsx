import React from 'react';
import Toast from '../components/common/Toast';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null); // Para limpiar timers pendientes

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    // 1. Limpiamos cualquier toast y timer previo
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(null);

    // 2. Log de auditoría para debug (puedes borrarlo luego)
    logger.info(`[Toast] Desplegando: ${message} (${type})`);

    /**
     * 3. Aumentamos ligeramente el delay a 50ms. 
     * Esto asegura que React termine de procesar los cambios en la tabla 
     * antes de intentar renderizar el Toast en una nueva capa.
     */
    timeoutRef.current = setTimeout(() => {
      // ✅ Cross-env ID: crypto.randomUUID() solo funciona en HTTPS.
      // Date.now() + random string funciona en HTTP local (móvil LAN) y producción.
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToast({ id, message, type });
    }, 50);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ESTRATEGIA DE RENDER:
          Asegúrate de que este bloque no esté envuelto en ningún div 
          con overflow-hidden en el árbol de componentes superior.
      */}
      {toast && (
        <Toast
          key={toast.id} // Forzamos un montaje limpio y estable usando UUID
          data={toast}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider.');
  }
  return context;
};