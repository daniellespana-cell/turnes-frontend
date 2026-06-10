import React from 'react';

import { createContext, useContext } from 'react';

// Creamos el contexto para las acciones de negocio del Chat
const ChatActionContext = createContext(null);

export const useChatActionsContext = () => {
    const context = useContext(ChatActionContext);
    if (!context) {
        throw new Error("useChatActionsContext must be used within a ChatActionProvider");
    }
    return context;
};

export const ChatActionProvider = ({
    children,
    onAcceptVideo,
    onDeclineVideo,
    onInviteVideo,
    onExecute,
    onSealChat,
    onRehire,
    onAcceptRehire,
    onDeclineRehire,
    isFinalizing
}) => {
    // Estas son las acciones críticas de negocio del Chat
    const actions = {
        onAcceptVideo,
        onDeclineVideo,
        onInviteVideo,
        onExecute,
        onSealChat,
        onRehire,
        onAcceptRehire,
        onDeclineRehire,
        isFinalizing
    };

    return (
        <ChatActionContext.Provider value={actions}>
            {children}
        </ChatActionContext.Provider>
    );
};
