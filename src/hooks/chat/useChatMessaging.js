import { useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../services/chat';
import { useAuth } from '../../context/AuthContext';

/**
 * ⚡ useChatMessaging (Supabase Edition)
 * Controls the active chat thread.
 */
export const useChatMessaging = (chatId, _otherParticipant, _permisos = {}, _config = {}) => {
  const { user } = useAuth();

  // 1. REACTIVE SUBSCRIPTION (Always fresh messages)
  const snapshot = useSyncExternalStore(
    ChatStorage.subscribe,
    ChatStorage.getSnapshot
  );

  // Selector: Get messages for THIS chat
  const messages = useMemo(() => snapshot.messages[chatId] || [], [snapshot.messages, chatId]);

  // 2. INITIALIZATION (KISS - No hooks spaghetti)
  useEffect(() => {
    if (!chatId || !user) return;
    
    // 🛡️ BINDING DE LECTURA: Informamos al estado que este chat está siendo visto
    ChatStorage.setActiveChat(chatId);
    ChatStorage.fetchMessages(chatId);

    // 🛡️ Auto-Reactivación Enterprise: Si el usuario entra al chat, des-archivar automáticamente
    const currentConv = ChatStorage.getSnapshot()?.conversations?.[chatId];
    if (currentConv?.protocol_state?.visibility?.[user.id]) {
      ChatStorage.manageChatVisibility(chatId, 'unarchive').catch(() => {});
    }

    return () => {
      // Limpiamos al salir para que los nuevos mensajes vuelvan a marcarse como no leídos
      ChatStorage.setActiveChat(null);
    };
  }, [chatId, user]);

  // 3. SEND MESSAGE
  const addMessage = useCallback(async (content, _sender = 'me', type = 'text', metadata = {}) => {
    if (!user) return;

    // Sender ID resolution: 'me' -> userId
    const senderUUID = user.id;

    // Call Global Store
    await ChatStorage.sendMessage(chatId, content, senderUUID, type, metadata);

  }, [chatId, user]);

  const clearHistory = useCallback(() => {
    console.warn("clearHistory no soportado en modo Cloud (Inmutable)");
  }, []);

  // 4. READ RECEIPTS (Auto-mark)
  useEffect(() => {
    if (!chatId || !user || messages.length === 0) return;

    // Check if there are any unread messages from the other person
    const hasUnreadFromOther = messages.some(m => m.sender !== user.id && !m.isRead);

    if (hasUnreadFromOther) {
      ChatStorage.markAsRead(chatId, user.id);
    }
  }, [chatId, user, messages]);

  return {
    messages,
    addMessage,
    clearHistory
  };
};