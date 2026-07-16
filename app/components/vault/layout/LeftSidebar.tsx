"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Plus,
   Folder,
   FolderPlus,
   ChevronDown,
   ChevronRight,
   FileText,
   Grid3X3,
   Presentation
} from 'lucide-react';

interface LeftSidebarProps {
   isLoading: boolean;
   folders: any[];
   documents: any[];
   activeDocumentId?: string;
   onCreateFolder: () => void;
   onCreateDocument: (type: 'doc' | 'sheet' | 'slide') => void;
   onSelectDocument: (doc: any) => void;
}

export default function LeftSidebar({
   isLoading,
   folders,
   documents,
   activeDocumentId,
   onCreateFolder,
   onCreateDocument,
   onSelectDocument
}: LeftSidebarProps) {
   const [showNewMenu, setShowNewMenu] = useState(false);
   const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

   const toggleFolder = (id: string) => {
      setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
   };

   return (
      <aside className="hidden md:flex w-72 border-r border-white/10 bg-card flex-col z-10 shrink-0">
         <div className="p-4 relative">
            <button
               onClick={() => setShowNewMenu(!showNewMenu)}
               className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all text-white hover:bg-white/10"
            >
               <Plus size={18} className={`text-blue-400 transition-transform duration-300 ${showNewMenu ? 'rotate-45' : ''}`} />
               New
            </button>

            <AnimatePresence>
               {showNewMenu && (
                  <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-2"
                  >
                     <button
                        onClick={() => {
                           onCreateFolder();
                           setShowNewMenu(false);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-all text-left group border-b border-white/10 mb-1 pb-3"
                     >
                        <FolderPlus size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">New Folder</span>
                     </button>
                     {[
                        { icon: FileText, label: 'Google Docs', type: 'doc', color: 'text-blue-400' },
                        { icon: Grid3X3, label: 'Google Sheets', type: 'sheet', color: 'text-green-400' },
                        { icon: Presentation, label: 'Google Slides', type: 'slide', color: 'text-yellow-400' }
                     ].map((item) => (
                        <button
                           key={item.type}
                           onClick={() => {
                              onCreateDocument(item.type as any);
                              setShowNewMenu(false);
                           }}
                           className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-all text-left group"
                        >
                           <item.icon size={18} className={item.color} />
                           <span className="text-sm font-medium text-slate-300 group-hover:text-white">{item.label}</span>
                        </button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="flex-1 overflow-y-auto px-2 pb-8 space-y-4 scrollbar-hide">
            <div className="flex items-center justify-between px-3 mt-2">
               <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Drive</h3>
               <button
                  onClick={onCreateFolder}
                  className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-all"
                  title="Create New Folder"
               >
                  <FolderPlus size={16} />
               </button>
            </div>

            <div className="space-y-1">
               {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                     <div key={idx} className="animate-pulse flex items-center gap-2 px-3 py-2">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <div className="w-4 h-4 bg-white/10 rounded" />
                        <div className="h-3 bg-white/10 rounded w-24" />
                     </div>
                  ))
               ) : (
                  folders.map(folder => {
                     const isOpen = openFolders[folder.id];
                     const folderDocs = documents.filter(d => d.folderId?.toString() === folder.id.toString());
                     
                     return (
                        <div key={folder.id} className="space-y-0.5">
                           <button
                              onClick={() => toggleFolder(folder.id)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 transition-all group"
                           >
                              <div className="text-slate-500 group-hover:text-white transition-colors">
                                 {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </div>
                              <Folder size={16} className={isOpen ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"} fill={isOpen ? "currentColor" : "none"} />
                              <span className="text-sm font-medium flex-1 text-left truncate">{folder.name}</span>
                           </button>

                           {isOpen && (
                              <div className="space-y-0.5">
                                 {folderDocs.map(doc => {
                                    const isDocActive = activeDocumentId === doc.id;
                                    const DocIcon = (doc.type === 'docx' || doc.type === 'doc' || doc.type === 'google_doc') ? FileText : 
                                                  (doc.type === 'xlsx' || doc.type === 'sheet' || doc.type === 'google_sheet') ? Grid3X3 : Presentation;
                                    const iconColor = isDocActive ? "text-blue-600" :
                                                    (doc.type === 'docx' || doc.type === 'doc' || doc.type === 'google_doc') ? "text-blue-400" : 
                                                    (doc.type === 'xlsx' || doc.type === 'sheet' || doc.type === 'google_sheet') ? "text-green-400" : "text-yellow-400";
                                    
                                    return (
                                       <button
                                          key={doc.id}
                                          onClick={() => onSelectDocument(doc)}
                                          className={`w-full pl-9 pr-3 py-1.5 rounded-lg flex items-center gap-2.5 transition-all ${isDocActive
                                             ? 'bg-[#c2e7ff] text-[#001d35]'
                                             : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                             }`}
                                       >
                                          <DocIcon size={16} className={iconColor} />
                                          <span className="text-sm truncate font-medium">{doc.title}</span>
                                       </button>
                                    );
                                 })}
                                 {folderDocs.length === 0 && (
                                    <p className="text-xs text-slate-600 italic py-1 pl-10">Empty folder</p>
                                 )}
                              </div>
                           )}
                        </div>
                     );
                  })
               )}

               {/* Uncategorized Documents */}
               <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="space-y-0.5">
                     {documents.filter(d => !d.folderId).map(doc => {
                        const isDocActive = activeDocumentId === doc.id;
                        const DocIcon = (doc.type === 'docx' || doc.type === 'doc' || doc.type === 'google_doc') ? FileText : 
                                      (doc.type === 'xlsx' || doc.type === 'sheet' || doc.type === 'google_sheet') ? Grid3X3 : Presentation;
                        const iconColor = isDocActive ? "text-blue-600" :
                                        (doc.type === 'docx' || doc.type === 'doc' || doc.type === 'google_doc') ? "text-blue-400" : 
                                        (doc.type === 'xlsx' || doc.type === 'sheet' || doc.type === 'google_sheet') ? "text-green-400" : "text-yellow-400";

                        return (
                           <button
                              key={doc.id}
                              onClick={() => onSelectDocument(doc)}
                              className={`w-full px-3 py-1.5 rounded-lg flex items-center gap-2.5 transition-all ${isDocActive
                                 ? 'bg-[#c2e7ff] text-[#001d35]'
                                 : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                 }`}
                           >
                              <DocIcon size={16} className={iconColor} />
                              <span className="text-sm font-medium truncate">{doc.title}</span>
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      </aside>
   );
}
