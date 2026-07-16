"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   MessageSquare,
   History,
   Share2,
   Download,
   MoreVertical,
   Video,
   Globe,
   FileText,
   Grid3X3,
   Presentation,
   ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface TopNavigationProps {
   documentType: 'doc' | 'sheet' | 'slide' | 'pdf' | string;
   documentTitle: string;
   isSaving: boolean;
   onTitleChange: (title: string) => void;
   onShareClick: () => void;
}

export default function TopNavigation({
   documentType,
   documentTitle,
   isSaving,
   onTitleChange,
   onShareClick
}: TopNavigationProps) {
   const [activeMenu, setActiveMenu] = useState<string | null>(null);
   const menuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveMenu(null);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const triggerAction = (action: string) => {
      document.dispatchEvent(new CustomEvent('editor-action', { detail: { action } }));
      setActiveMenu(null);
   };

   const Icon = documentType === 'sheet' ? Grid3X3 : documentType === 'slide' ? Presentation : FileText;
   const iconColor = documentType === 'sheet' ? 'text-green-500' : documentType === 'slide' ? 'text-yellow-500' : 'text-blue-500';

   return (
      <header className="relative z-40 h-[64px] border-b border-white/10 bg-card flex items-center justify-between px-4 select-none">
         <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => document.dispatchEvent(new CustomEvent('editor-action', { detail: { action: 'open' } }))} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 mr-1" title="Back to Document Vault">
               <ChevronLeft size={20} />
            </button>
            
            <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${iconColor} bg-white/5`}>
               <Icon size={24} />
            </div>

            <div className="flex flex-col ml-1 min-w-0 max-w-[400px]">
               <input
                  type="text"
                  value={documentTitle || 'Untitled Document'}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="bg-transparent border border-transparent hover:border-white/20 focus:border-blue-500 focus:bg-white/5 rounded px-1.5 py-0.5 text-lg font-normal text-white truncate focus:outline-none transition-all"
               />
               <div className="flex items-center gap-1 mt-0.5 relative overflow-x-auto scrollbar-hide max-w-[calc(100vw-150px)] sm:max-w-none" ref={menuRef}>
                  {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'].map(item => (
                     <div key={item} className="relative">
                        <button 
                           onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                           className={`px-2 py-0.5 text-[13px] rounded transition-colors cursor-pointer ${activeMenu === item ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                        >
                           {item}
                        </button>

                        <AnimatePresence>
                           {activeMenu === item && (
                              <motion.div
                                 initial={{ opacity: 0, y: 5 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 5 }}
                                 transition={{ duration: 0.1 }}
                                 className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-white/10 shadow-2xl rounded-lg py-1 z-50 text-[13px]"
                              >
                                 {item === 'File' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2" onClick={onShareClick}>Share</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2" onClick={() => triggerAction('new')}>New</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2" onClick={() => triggerAction('open')}>Open</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2" onClick={() => triggerAction('download')}>Download</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2" onClick={() => triggerAction('rename')}>Rename</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 flex items-center gap-2 text-red-400" onClick={() => triggerAction('trash')}>Move to trash</button>
                                    </>
                                 )}
                                 {item === 'Edit' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('undo')}>Undo</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('redo')}>Redo</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('cut')}>Cut</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('copy')}>Copy</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('paste')}>Paste</button>
                                    </>
                                 )}
                                 {item === 'Insert' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('insert-image')}>Image</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('insert-table')}>Table</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Drawing</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('insert-link')}>Link</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Comment</button>
                                    </>
                                 )}
                                 {item === 'View' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Mode</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Show ruler</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Show outline</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('fullscreen')}>Full screen</button>
                                    </>
                                 )}
                                 {item === 'Format' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Text</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Paragraph styles</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Align & indent</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Line & paragraph spacing</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5" onClick={() => triggerAction('clear-formatting')}>Clear formatting</button>
                                    </>
                                 )}
                                 {item === 'Tools' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Spelling and grammar</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Word count</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Compare documents</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Citations</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Dictionary</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Translate document</button>
                                    </>
                                 )}
                                 {item === 'Extensions' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Add-ons</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Macros</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Apps Script</button>
                                    </>
                                 )}
                                 {item === 'Help' && (
                                    <>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Help</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Training</button>
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Updates</button>
                                       <div className="h-px bg-white/10 my-1" />
                                       <button className="w-full text-left px-4 py-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-50">Keyboard shortcuts</button>
                                    </>
                                 )}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center text-xs text-slate-400 mr-2">
               {isSaving ? 'Saving...' : 'Saved to Drive'}
            </div>

            <button className="hidden sm:block p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors tooltip-trigger" title="Open comment history">
               <MessageSquare size={18} />
            </button>
            <button className="hidden sm:block p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors tooltip-trigger" title="Join call">
               <Video size={18} />
            </button>

            <button
               onClick={onShareClick}
               className="ml-1 sm:ml-2 flex items-center gap-2 px-3 sm:px-6 py-2 bg-[#c2e7ff] hover:bg-[#b3dcf6] text-[#001d35] rounded-full text-sm font-medium transition-all"
            >
               <Share2 size={16} />
               <span className="hidden sm:inline">Share</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium ml-2 cursor-pointer border-2 border-transparent hover:border-white/20">
               OS
            </div>
         </div>
      </header>
   );
}
