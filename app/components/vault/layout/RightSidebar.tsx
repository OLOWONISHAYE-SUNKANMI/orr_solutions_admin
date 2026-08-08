"use client";

import React, { useState } from 'react';
import { Zap, ArrowRight, X, Clock, Settings, Users, FileText, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vaultApi } from '@/lib/vault-api';
import { useVaultStore } from '@/store/vaultStore';

interface RightSidebarProps {
   documentTitle: string;
   documentContent?: string;
   documentType?: string;
   documentId?: string;
}

type TabType = 'ai' | 'comments' | 'history' | 'properties';

export default function RightSidebar({ documentTitle, documentContent, documentType, documentId }: RightSidebarProps) {
   const [activeTab, setActiveTab] = useState<TabType>('ai');
   const { updateDocumentMetadata } = useVaultStore();
   
   // AI State
   const [aiInput, setAiInput] = useState('');
   const [isAiLoading, setIsAiLoading] = useState(false);
   const [aiMessages, setAiMessages] = useState<{id: string, role: 'user'|'assistant', content: string}[]>([
      { id: '1', role: 'assistant', content: `I can help you structure the data in ${documentTitle || 'this asset'}. Would you like an outline?` }
   ]);

   const handleAiSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
      e?.preventDefault();
      const text = customPrompt || aiInput.trim();
      if (!text || isAiLoading) return;

      const shouldEdit = window.confirm("Would you like to write/insert this directly into the document? (Cancel = Just chat)");

      if (!customPrompt) setAiInput('');
      setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
      setIsAiLoading(true);

      try {
         const history = aiMessages.map(m => ({ role: m.role, content: m.content }));
         const context = `Document type: ${documentType || 'unknown'}. Title: ${documentTitle || 'Untitled'}. Content excerpt: ${documentContent ? documentContent.substring(0, 1000) : 'No content'}`;
         const reply = await vaultApi.askAIAssistant(text, context, history);
         
         if (reply.includes("I'm experiencing a temporary issue") || reply.includes("RESOURCE_EXHAUSTED")) {
            setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'AI Quota Exceeded. Please check your Google Cloud Billing limits for the Gemini API.' }]);
         } else {
            setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }]);
            if (shouldEdit && documentId) {
               await updateDocumentMetadata(documentId, { description: reply });
               setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '✨ Document content successfully updated with the generated content!' }]);
            }
         }
      } catch (err) {
         console.error(err);
         setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
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
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#cdff00]">
                        <Zap size={16} />
                     </div>
                     <div>
                        <h3 className="text-sm font-medium text-white">Gemini</h3>
                        <p className="text-xs text-slate-500">AI Assistant</p>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {aiMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                           <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-[#cdff00]/20 text-[#cdff00] border border-[#cdff00]/30'}`}>
                              {msg.role === 'user' ? <User size={14} /> : <Zap size={14} />}
                           </div>
                           <div className={`text-xs leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'text-white' : 'text-slate-300'} whitespace-pre-wrap p-2 rounded-lg bg-white/5`}>
                              {msg.content}
                           </div>
                        </div>
                     ))}
                     {isAiLoading && (
                        <div className="flex gap-3">
                           <div className="w-6 h-6 rounded-md bg-[#cdff00]/20 text-[#cdff00] border border-[#cdff00]/30 flex items-center justify-center shrink-0">
                              <Zap size={14} />
                           </div>
                           <div className="text-xs text-slate-500 flex items-center bg-white/5 p-2 rounded-lg">
                              <Loader2 size={12} className="animate-spin mr-2" /> Thinking...
                           </div>
                        </div>
                     )}
                     
                     {aiMessages.length === 1 && (
                        <div className="mt-4">
                           <button 
                              onClick={() => handleAiSubmit(undefined, "Generate a detailed outline for this document.")}
                              disabled={isAiLoading}
                              className="w-full py-2 bg-transparent border border-white/10 text-slate-300 rounded text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                           >
                              Generate Outline
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="p-4 border-t border-white/10 shrink-0">
                     <form onSubmit={handleAiSubmit} className="relative">
                        <input
                           type="text"
                           value={aiInput}
                           onChange={e => setAiInput(e.target.value)}
                           disabled={isAiLoading}
                           placeholder="Ask Gemini..."
                           className="w-full bg-[#1a1f26] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <button 
                           type="submit"
                           disabled={!aiInput.trim() || isAiLoading}
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
