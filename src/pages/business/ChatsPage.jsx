import React from 'react';
import { ChatList } from '../../components/chat/ChatList';
import { useChats } from '../../hooks/chat/useChats';

const ChatsPage = () => {
    const { chats } = useChats();

    return (
        <div className="h-[calc(100vh-5rem)] border-t border-white/5 animate-fade-in font-manrope overflow-hidden p-0 md:p-6">
            <div className="max-w-3xl mx-auto h-full flex flex-col">
                {/* Container "Messenger Style" - Clean & Flat */}
                <div className="flex-1 min-h-0 bg-black/40 border-x border-white/5 overflow-hidden backdrop-blur-sm">
                    <ChatList chats={chats} isDirectoryMode={true} />
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
