import React from 'react';
import Toast from '../components/common/Toast';

import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { logger } from '../utils/logger';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null); // Para limpiar timers pendientes

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((payload, defaultType = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(null);

    const toastData = typeof payload === 'object' && payload !== null
      ? { type: payload.type || defaultType, ...payload }
      : { message: payload, type: defaultType };

    logger.info(`[Toast] Desplegando: ${toastData.title || toastData.message} (${toastData.type})`);

    timeoutRef.current = setTimeout(() => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToast({ id, ...toastData });
    }, 50);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
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