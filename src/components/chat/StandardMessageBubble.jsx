import React from 'react';
import { CheckCheck, Clock } from 'lucide-react';


export const StandardMessageBubble = ({ message, isMe, isClosed }) => {
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                <div className={`px-3 py-2 rounded-xl shadow-sm transition-all ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-black rounded-tl-sm'
                    } ${isClosed ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <p className="text-[11.5px] leading-snug font-medium tracking-tight">
                        {message.text}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-700 px-1">
                    {isMe && message.status === 'sending' && (
                        <Clock size={10} className="text-zinc-500 animate-pulse" />
                    )}
                    {isMe && message.status === 'error' && (
                        <span className="text-red-500 flex items-center gap-1 font-bold">Falló ✗</span>
                    )}
                    {isMe && message.status === 'sent' && (
                        <CheckCheck
                            size={10}
                            className={
                                isClosed ? 'text-zinc-800'
                                    : message.isRead ? 'text-blue-500'
                                        : 'text-zinc-500'
                            }
                        />
                    )}
                    <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StandardMessageBubble;
