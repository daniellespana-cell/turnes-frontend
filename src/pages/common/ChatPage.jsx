import React from 'react';
import BusinessChatPage from '../business/BusinessChatPage';
import WorkerChatPage from '../worker/WorkerChatPage';
import ChatLoadingSkeleton from '../../components/chat/ChatLoadingSkeleton';

import { useAuth } from '../../context/AuthContext';

/**
 * ⚡ ChatPage Dispatcher (Senior Architecture 2026)
 * Pattern: Container-Presenter con Role-Based Controllers.
 * 
 * Separa completamente la lógica de negocio, dependencias y Hooks de la Empresa
 * y del Trabajador, evitando "Race Conditions" en la resolución de identidad
 * y fallos al consultar historial SQL.
 */
const ChatPage = () => {
  const { user } = useAuth();

  // Safety Net: Espera a que el proveedor de autenticación resuelva.
  if (!user) return <ChatLoadingSkeleton />;

  // Dispatcher estricto: Contextos aislados al 100%
  if (user.role === 'empresa') {
    return <BusinessChatPage />;
  }

  return <WorkerChatPage />;
};

export default ChatPage;