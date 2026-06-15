"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Loader2, Maximize2, ExternalLink } from 'lucide-react';
import TopNavigation from './TopNavigation';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

interface WorkspaceShellProps {
   activeDocument: any | null;
   documents: any[];
   folders: any[];
   isLoading: boolean;
   isSaving: boolean;
   clients: any[];
   onCreateFolder: () => void;
   onCreateDocument: (type: 'doc' | 'sheet' | 'slide') => void;
   onSelectDocument: (doc: any) => void;
   onUpdateTitle: (title: string) => void;
   onShareClick: () => void;
   renderEditor: () => React.ReactNode;
}

export default function WorkspaceShell({
   activeDocument,
   documents,
   folders,
   isLoading,
   isSaving,
   clients,
   onCreateFolder,
   onCreateDocument,
   onSelectDocument,
   onUpdateTitle,
   onShareClick,
   renderEditor
}: WorkspaceShellProps) {
   const [isFullScreen, setIsFullScreen] = useState(false);
   const isMock = activeDocument?.google_drive_id?.startsWith('mock_') || activeDocument?.link?.includes('mock_');

   return (
      <div className="h-screen bg-card text-white flex flex-col relative overflow-hidden">
         {!isFullScreen && activeDocument && (
            <TopNavigation 
               documentType={activeDocument.type} 
               documentTitle={activeDocument.title}
               isSaving={isSaving}
               onTitleChange={onUpdateTitle}
               onShareClick={onShareClick}
            />
         )}

         <main className="flex-1 flex overflow-hidden">
            {!isFullScreen && (
               <LeftSidebar 
                  isLoading={isLoading}
                  folders={folders}
                  documents={documents}
                  activeDocumentId={activeDocument?.id}
                  onCreateFolder={onCreateFolder}
                  onCreateDocument={onCreateDocument}
                  onSelectDocument={onSelectDocument}
               />
            )}

            <div className="flex-1 relative flex flex-col bg-card">
               <AnimatePresence mode="wait">
                  {activeDocument ? (
                     <motion.div
                        key={activeDocument.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                     >
                        {(activeDocument.link || activeDocument.webViewLink) && !isMock ? (
                           <div className="flex-1 bg-card flex flex-col">
                              <div className="h-10 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activeDocument.type === 'pdf' ? 'bg-red-500' : (activeDocument.type === 'docx' || activeDocument.type === 'xlsx' || activeDocument.type === 'pptx') ? 'bg-blue-400' : 'bg-green-500'}`} />
                                    <span className="text-xs font-semibold text-slate-400">
                                       {activeDocument.type === 'pdf' ? 'PDF Viewer' : (activeDocument.documentSource?.startsWith('google_')) ? 'Live Google Sync' : 'Office Preview'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <a
                                       href={activeDocument.link || activeDocument.webViewLink}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                       Open in new tab <ExternalLink size={12} />
                                    </a>
                                 </div>
                              </div>
                              <iframe
                                 src={(() => {
                                    const link = activeDocument.link || activeDocument.webViewLink;
                                    const isGoogleNative = activeDocument.documentSource?.startsWith('google_') || link.includes('docs.google.com');

                                    if (activeDocument.type === 'pdf') return link;
                                    if (isGoogleNative) return link;
                                    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(activeDocument.type)) {
                                       return `https://docs.google.com/viewer?url=${encodeURIComponent(link)}&embedded=true`;
                                    }
                                    return link;
                                 })()}
                                 className="flex-1 w-full border-none bg-white"
                                 title={activeDocument.title}
                              />
                           </div>
                        ) : (
                           renderEditor()
                        )}
                     </motion.div>
                  ) : (
                     <div className="flex-1 flex items-center justify-center bg-card">
                        <div className="text-center space-y-4 max-w-sm">
                           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mx-auto">
                              <FileText size={32} />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-xl font-normal text-white">Welcome to Document Studio</h3>
                              <p className="text-slate-400 text-sm">Select a file from the sidebar or create a new one to get started.</p>
                           </div>
                        </div>
                     </div>
                  )}
               </AnimatePresence>

               {/* Editor Footer Tools */}
               {activeDocument && (
                  <div className="h-8 border-t border-white/10 bg-white/[0.02] flex items-center justify-between px-4 text-slate-500 text-xs z-10 shrink-0">
                     <div className="flex items-center gap-4">
                        <button
                           onClick={() => setIsFullScreen(!isFullScreen)}
                           className={`flex items-center gap-1 transition-colors hover:text-white`}
                        >
                           <Maximize2 size={12} />
                           <span>{isFullScreen ? 'Exit full screen' : 'Full screen'}</span>
                        </button>
                     </div>
                     <div className="flex items-center gap-4">
                        <span>Last edited recently</span>
                     </div>
                  </div>
               )}
            </div>

            {!isFullScreen && activeDocument && (
               <RightSidebar documentTitle={activeDocument.title} />
            )}
         </main>
      </div>
   );
}
