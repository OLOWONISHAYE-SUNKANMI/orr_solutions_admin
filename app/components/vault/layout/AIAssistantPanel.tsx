import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles, X } from 'lucide-react';
import { vaultApi } from '@/lib/vault-api';

interface AIAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle?: string;
    documentContent?: string;
    documentType?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AIAssistantPanel({ isOpen, onClose, documentTitle, documentContent, documentType }: AIAssistantPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', role: 'assistant', content: 'Hello! I am your AI Assistant. How can I help you with this document?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const context = `The user is currently viewing a ${documentType || 'document'} titled "${documentTitle || 'Untitled'}". 
Content excerpt: ${documentContent ? documentContent.substring(0, 1000) : 'No content available.'}`;
            
            const reply = await vaultApi.askAIAssistant(userMsg, context, history);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 border-l border-white/10 bg-[#0f1115] flex flex-col h-full flex-shrink-0 z-20 shadow-2xl relative">
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`text-xs leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'text-white' : 'text-slate-300'} whitespace-pre-wrap`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <Bot size={14} />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                            <Loader2 size={12} className="animate-spin mr-2" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-white/[0.01]">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask AI anything..."
                        className="w-full bg-[#1a1f26] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-lemon disabled:opacity-50 disabled:hover:text-primary transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}
