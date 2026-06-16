import React from 'react';
import { ChatActionProvider } from '../../context/ChatActionContext';
import MessageRenderer from './MessageRenderer';
import ChatSafetyFooter from './ChatSafetyFooter';

import { useRef, useEffect } from 'react';

// Components

// Hooks
import { useChatActions } from '../../hooks/useChatActions';
import { useAuth } from '../../context/AuthContext';

export const MessageList = ({
  messages,
  setMessages,
  onStartVideo,
  onDeclineVideo,
  isClosed,
  isPaid,
  onExecute,
  onFinalize,
  onSealChat,
  onVideoInvite,
  aceptarInvitacionVideo,
  finanzas,
  permisos,
  onPay,
  candidato,
  onAcceptRehire,
  onDeclineRehire,
  userRole,
  isFinalizing,
  activeStep
}) => {
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();

  // 1. BUSINESS LOGIC
  const { handleRehireAction } = useChatActions({
    candidato,
    onFinalize,
    messages,
    setMessages
  });

  // 2. SCROLL MANAGEMENT
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    scrollToBottom();
    // Safety timeouts for image/layout shifts
    const t1 = setTimeout(scrollToBottom, 50);
    const t2 = setTimeout(scrollToBottom, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [messages.length]);

  // 3. HANDLERS BUNDLE
  const handlers = {
    onRehire: handleRehireAction,
    onAcceptVideo: onStartVideo,
    aceptarInvitacionVideo: aceptarInvitacionVideo,
    onDeclineVideo: onDeclineVideo,
    onInviteVideo: onVideoInvite,
    onExecute: onExecute,
    onFinalize: onFinalize,
    onSealChat: onSealChat
  };


  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar min-h-0 bg-transparent relative">

      {/* A. MESSAGE LOOP (Strategy Pattern with Context) */}
      <ChatActionProvider
        onAcceptVideo={onStartVideo}
        aceptarInvitacionVideo={handlers.aceptarInvitacionVideo}
        onDeclineVideo={onDeclineVideo}
        onInviteVideo={onVideoInvite}
        onExecute={onExecute}
        onSealChat={onSealChat}
        onRehire={handleRehireAction}
        onAcceptRehire={onAcceptRehire}
        onDeclineRehire={onDeclineRehire}
        isFinalizing={isFinalizing}
      >
        {messages.map((msg, index) => (
            <MessageRenderer
              key={msg.id || `msg-${index}`}
              msg={msg}
              index={index}
              allMessages={messages}
              state={{ isClosed }}
              currentUser={currentUser}
              userRole={userRole}
            />
          ))}
      </ChatActionProvider>

      <div ref={messagesEndRef} className="h-2" />

      {/* B. SAFETY FOOTER */}
      <ChatSafetyFooter isPaid={isPaid} isClosed={isClosed} />

    </div>
  );
};

export default MessageList;