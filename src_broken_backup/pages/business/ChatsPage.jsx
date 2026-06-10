import { useChats } from '../../hooks/chat/useChats';

const ChatsPage = () => {
    const { chats } = useChats();

    return (
        <div className="flex-1 flex flex-col animate-fade-in font-manrope overflow-hidden p-0 md:p-6">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0">
                {/* Container "Messenger Style" - Clean & Flat */}
                <div className="flex-1 min-h-0 bg-black/30 overflow-hidden backdrop-blur-sm rounded-2xl">
                    <ChatList chats={chats} isDirectoryMode={true} />
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
