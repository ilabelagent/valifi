import React, { useState, useRef, useEffect } from 'react';
import type { P2PChatMessage } from '../types';
import { SendIcon, PaperclipIcon } from './icons';
import { timeAgo } from './utils';

interface P2PChatInterfaceProps {
    messages: P2PChatMessage[];
    onSendMessage: (text: string) => void;
    currentUserId: string;
    counterpartyName: string;
}

const P2PChatInterface: React.FC<P2PChatInterfaceProps> = ({ messages, onSendMessage, currentUserId, counterpartyName }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        onSendMessage(newMessage);
        setNewMessage('');
    };
    
    const isTyping = messages.some(msg => msg.isTyping && msg.authorId !== currentUserId);

    return (
        <div className="flex flex-col h-full bg-slate-900/70 rounded-lg border border-slate-700">
             <div className="p-3 border-b border-slate-700">
                <p className="font-semibold text-center text-white">{counterpartyName}</p>
             </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.filter(m => !m.isTyping).map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${msg.authorId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        {msg.authorId !== currentUserId && msg.authorId !== 'system' && (
                            <img src={`https://i.pravatar.cc/40?u=${msg.authorId}`} alt={msg.authorName} className="w-6 h-6 rounded-full flex-shrink-0" />
                        )}
                        <div className={`flex flex-col max-w-xs md:max-w-sm ${msg.authorId === currentUserId ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-xl px-3 py-2 ${
                                msg.authorId === currentUserId ? 'bg-sky-600 text-white rounded-br-none' : 
                                msg.authorId === 'system' ? 'bg-slate-700 text-slate-300 text-xs italic text-center w-full rounded-none' : 'bg-slate-700/80 text-white rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 px-1">
                                {timeAgo(msg.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                     <div className="flex items-end gap-2.5 justify-start">
                        <img src={`https://i.pravatar.cc/40?u=${messages.find(m=>m.isTyping)?.authorId}`} alt="typing user" className="w-6 h-6 rounded-full flex-shrink-0" />
                        <div className="rounded-xl px-3 py-2 bg-slate-700/80 rounded-bl-none">
                             <div className="flex items-center gap-1.5 pt-1">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                             </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 flex items-center gap-2">
                <button type="button" className="text-slate-400 hover:text-white p-2">
                    <PaperclipIcon className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-full py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold p-2.5 rounded-full" disabled={!newMessage.trim()}>
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default P2PChatInterface;
