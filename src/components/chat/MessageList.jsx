import React, { useRef, useEffect } from 'react';

// Components
import { MessageRenderer } from './MessageRenderer';
import { ChatSafetyFooter } from './ChatSafetyFooter';
import MobileActionDashboard from './MobileActionDashboard';

// Hooks
import { useChatActions } from '../../hooks/useChatActions';

export const MessageList = ({
  messages,
  setMessages,
  onStartVideo,
  onDeclineVideo,
  isClosed,
  isPaid,
  onExecute,
  onFinalize,
  onInviteVideo,
  finanzas,
  permisos,
  onPay,
  candidato
}) => {
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

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
    onDeclineVideo: onDeclineVideo,
    onInviteVideo: onInviteVideo,
    onExecute: onExecute,
    onFinalize: onFinalize
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar min-h-0 bg-transparent relative">

      {/* A. MESSAGE LOOP (Strategy Pattern) */}
      {messages.map((msg, index) => (
        <MessageRenderer
          key={msg.id || index}
          msg={msg}
          index={index}
          allMessages={messages}
          handlers={handlers}
          state={{ isClosed }}
        />
      ))}

      <div ref={messagesEndRef} className="h-2" />

      {/* B. SAFETY FOOTER */}
      <ChatSafetyFooter isPaid={isPaid} isClosed={isClosed} />

      {/* C. MOBILE DASHBOARD */}
      <MobileActionDashboard
        permisos={permisos}
        finanzas={finanzas}
        candidato={candidato}
        onPay={onPay}
        onVideoInvite={onInviteVideo}
        onExecute={onExecute}
        onFinalize={onFinalize}
      />
    </div>
  );
};

export default MessageList;