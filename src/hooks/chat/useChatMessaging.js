import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../utils/chatStorage';
import { useAuth } from '../../context/AuthContext';

/**
 * ⚡ useChatMessaging (Supabase Edition)
 * Controls the active chat thread.
 */
export const useChatMessaging = (chatId, otherParticipant, permisos = {}, config = {}) => {
  const { user } = useAuth();
  const initialized = useRef(false);

  // 1. REACTIVE SUBSCRIPTION (Always fresh messages)
  const snapshot = useSyncExternalStore(
    ChatStorage.subscribe,
    ChatStorage.getSnapshot
  );

  // Selector: Get messages for THIS chat
  const messages = snapshot.messages[chatId] || [];

  // 2. INITIALIZATION & LAZY LOAD
  useEffect(() => {
    if (!chatId || !user) return;

    // Cargar historial si no existe
    ChatStorage.fetchMessages(chatId);

    // PROTOCOL INJECTION LOGIC (Solo si estamos vacíos y hay permiso)
    // Usamos una ref para asegura ejecución única por montaje
    if (!initialized.current) {
      initialized.current = true;

      // Verifica si ya cargó (puede ser async, así que chequeamos un poco después o confiamos en length)
      // ALERTA: fetchMessages es async. Si messages.length es 0 AHORA, no significa que esté vacío en DB.
      // Mejor estrategia: La inyección de protocolo debería ser SERVER SIDE o explicita por el usuario 'Iniciar Protocolo'.
      // Para MVP: Lo omitimos o lo hacemos solo si confirmamos Empty tras carga. 
      // Por seguridad y simplicidad MVP: Omitimos "Auto-Greeting" mágico por ahora para evitar spam.
    }

  }, [chatId, user]);

  // 3. SEND MESSAGE
  const addMessage = useCallback(async (content, sender = 'me', type = 'text', metadata = {}) => {
    if (!user) return;

    // Sender ID resolution: 'me' -> userId
    const senderUUID = user.id;

    // Call Global Store
    await ChatStorage.sendMessage(chatId, content, senderUUID, type, metadata);

  }, [chatId, user]);

  const clearHistory = useCallback(() => {
    console.warn("clearHistory no soportado en modo Cloud (Inmutable)");
  }, []);

  return {
    messages,
    addMessage,
    clearHistory
  };
};