"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Zap, ArrowRight, X, Clock, Settings, Users, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RightSidebarProps {
   documentTitle: string;
   documentId?: string | number;
}

type TabType = 'ai' | 'comments' | 'history' | 'properties';

export default function RightSidebar({ documentTitle, documentId }: RightSidebarProps) {
   const [activeTab, setActiveTab] = useState<TabType>('ai');
   const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
   const [chatInput, setChatInput] = useState('');
   const [isAiLoading, setIsAiLoading] = useState(false);
   const chatEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [chatHistory, isAiLoading]);

   useEffect(() => {
      const fetchHistory = async () => {
         if (!documentId) return;
         setChatHistory([]); // Clear previous document's history
         setIsAiLoading(true); // Optional: show loading while fetching
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/ai/chat/?session_id=doc_${documentId}_admin`, {
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
               },
               cache: 'no-store'
            });
            if (response.ok) {
               const data = await response.json();
               const historyMessages = data?.data?.messages || data?.messages;
               if (historyMessages && Array.isArray(historyMessages)) {
                  setChatHistory(historyMessages.map((m: any) => ({
                     role: m.role === 'assistant' ? 'ai' : 'user',
                     content: m.content
                  })));
               }
            }
         } catch (err) {
            console.error("Failed to fetch chat history:", err);
         } finally {
            setIsAiLoading(false);
         }
      };
      
      fetchHistory();
   }, [documentId]);

   const handleGenerateOutline = async () => {
      if (!documentId) return;
      setIsAiLoading(true);
      setChatHistory(prev => [...prev, { role: 'user', content: 'Generate an outline for this document.' }]);
      
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/ai/document-summary/`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ 
               document_id: documentId, 
               title: documentTitle,
               session_id: `doc_${documentId}_admin`
            })
         });
         
         const data = await response.json();
         const summary = data?.summary || data?.data?.summary || 'Failed to generate outline.';
         const keyPoints = data?.key_points || data?.data?.key_points || [];
         
         let aiResponse = summary;
         if (keyPoints.length > 0) {
            aiResponse += '\n\n**Key Points:**\n- ' + keyPoints.join('\n- ');
         }
         
         setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
      } catch (err) {
         setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error generating the outline.' }]);
      } finally {
         setIsAiLoading(false);
      }
   };

   const handleSendMessage = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInput.trim() || isAiLoading) return;
      
      const message = chatInput.trim();
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', content: message }]);
      setIsAiLoading(true);
      
      try {
         const formattedHistory = chatHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            content: msg.content
         }));
         
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/ai/chat/`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ 
               message: message,
               session_id: `doc_${documentId}_admin`,
               document_id: documentId,
               conversation_history: formattedHistory,
               context: `The user is currently viewing a document titled "${documentTitle}".`
            })
         });
         
         const data = await response.json();
         const reply = data?.reply || data?.data?.reply || 'Sorry, I could not process that request.';
         
         setChatHistory(prev => [...prev, { role: 'ai', content: reply }]);
      } catch (err) {
         setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error responding to your question.' }]);
      } finally {
         setIsAiLoading(false);
      }
   };

   return (
      <aside className="hidden lg:flex w-80 border-l border-white/10 bg-card flex-col z-10 shrink-0">
         <div className="flex border-b border-white/10 p-2 gap-1 bg-white/[0.02]">
            <button
               onClick={() => setActiveTab('ai')}
               className={`flex-1 p-2 flex justify-center items-center rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
               title="Gemini AI"
            >
               <Zap size={16} className={activeTab === 'ai' ? 'text-[#cdff00]' : ''} />
            </button>
            <button
               onClick={() => setActiveTab('comments')}
               className={`flex-1 p-2 flex justify-center items-center rounded-lg transition-colors ${activeTab === 'comments' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
               title="Comments"
            >
               <Users size={16} />
            </button>
            <button
               onClick={() => setActiveTab('history')}
               className={`flex-1 p-2 flex justify-center items-center rounded-lg transition-colors ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
               title="Version History"
            >
               <Clock size={16} />
            </button>
            <button
               onClick={() => setActiveTab('properties')}
               className={`flex-1 p-2 flex justify-center items-center rounded-lg transition-colors ${activeTab === 'properties' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
               title="Properties"
            >
               <Settings size={16} />
            </button>
         </div>

         <AnimatePresence mode="wait">
            {activeTab === 'ai' && (
               <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col min-h-0"
               >
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0 bg-white/[0.01]">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#cdff00]">
                        <Zap size={16} />
                     </div>
                     <div>
                        <h3 className="text-sm font-medium text-white">Gemini</h3>
                        <p className="text-xs text-slate-500">AI Assistant</p>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {chatHistory.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                           <p className="text-sm text-slate-300 leading-relaxed">
                              I can help you structure the data in {documentTitle || 'this asset'}. Would you like an outline?
                           </p>
                           <button 
                              onClick={handleGenerateOutline}
                              disabled={isAiLoading}
                              className="w-full py-2 bg-transparent border border-white/10 text-slate-300 rounded text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                           >
                              Generate Outline
                           </button>
                        </div>
                     ) : (
                        chatHistory.map((msg, index) => (
                           <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                 msg.role === 'user' 
                                 ? 'bg-primary/20 text-white border border-primary/30' 
                                 : 'bg-white/5 text-slate-200 border border-white/10'
                              }`}>
                                 <div className="whitespace-pre-wrap">{msg.content}</div>
                              </div>
                           </div>
                        ))
                     )}
                     
                     {isAiLoading && (
                        <div className="flex justify-start">
                           <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-slate-400">
                              <Loader2 size={16} className="animate-spin" />
                           </div>
                        </div>
                     )}
                     <div ref={chatEndRef} />
                  </div>

                  <div className="p-4 border-t border-white/10 shrink-0 bg-white/[0.01]">
                     <form onSubmit={handleSendMessage} className="relative">
                        <input
                           type="text"
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           disabled={isAiLoading}
                           placeholder="Ask Gemini..."
                           className="w-full bg-[#1a1f26] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <button 
                           type="submit"
                           disabled={!chatInput.trim() || isAiLoading}
                           className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-slate-900 rounded-full hover:bg-lemon transition-colors disabled:opacity-50"
                        >
                           <ArrowRight size={14} />
                        </button>
                     </form>
                  </div>
               </motion.div>
            )}

            {activeTab === 'comments' && (
               <motion.div
                  key="comments"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto"
               >
                  <div className="flex items-center justify-center h-full text-center">
                     <div className="space-y-3 max-w-[200px]">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                           <Users size={24} />
                        </div>
                        <h4 className="text-sm font-medium text-white">No comments yet</h4>
                        <p className="text-xs text-slate-500">Highlight text and click the comment icon to start a discussion.</p>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'history' && (
               <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto"
               >
                  <div className="space-y-4">
                     <h3 className="text-sm font-medium text-white px-2">Version History</h3>
                     <div className="space-y-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                           <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#09090b]">
                              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_2px_#3b82f640]" />
                           </div>
                           <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-white/10 bg-white/5 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                 <div className="font-medium text-white text-xs">Current Version</div>
                                 <div className="text-[10px] text-slate-500">Just now</div>
                              </div>
                              <div className="text-xs text-slate-400">You are editing</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'properties' && (
               <motion.div
                  key="properties"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto"
               >
                  <h3 className="text-sm font-medium text-white mb-4">Document Properties</h3>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium">Type</label>
                        <div className="flex items-center gap-2 text-sm text-white">
                           <FileText size={14} className="text-blue-400" />
                           Google Docs
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium">Location</label>
                        <div className="text-sm text-white">My Drive</div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium">Owner</label>
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-medium">
                              OS
                           </div>
                           <span className="text-sm text-white">Me</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </aside>
   );
}
