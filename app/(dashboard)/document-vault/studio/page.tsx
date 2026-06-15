"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Grid3X3, Presentation } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useVaultStore } from '@/store/vaultStore';
import { useClientStore } from '@/store/clientStore';
import { vaultApi } from '@/lib/vault-api';

// Modular Architecture Imports
import WorkspaceShell from './components/layout/WorkspaceShell';
import DocsEditor from './components/editors/DocsEditor';
import SheetsEditor from './components/editors/SheetsEditor';
import SlidesEditor from './components/editors/SlidesEditor';

export default function DocumentStudioPage() {
   const { documents: drafts, folders: storeFolders, isLoadingDocuments: isLoading, fetchDocuments, fetchFolders, createGoogleDoc, createFolder: storeCreateFolder, updateDocumentMetadata } = useVaultStore();
   const { clients, fetchClients } = useClientStore();

   React.useEffect(() => {
      fetchDocuments(undefined, true);
      fetchFolders();
      fetchClients();
   }, [fetchDocuments, fetchFolders, fetchClients]);

   const [activeDocument, setActiveDocument] = useState<any | null>(null);
   const pendingSelectRef = React.useRef<string | null>(null);
   const [isSaving, setIsSaving] = useState(false);

   const [showShareModal, setShowShareModal] = useState(false);
   const [sharedClients, setSharedClients] = useState<string[]>([]);
   const [showNewAssetModal, setShowNewAssetModal] = useState(false);
   const [showFolderModal, setShowFolderModal] = useState(false);
   const [newFolderName, setNewFolderName] = useState("");
   const [newAssetData, setNewAssetData] = useState({
      title: '',
      type: 'doc' as 'doc' | 'sheet' | 'slide',
      clientId: '',
      folderId: '' as string | null
   });

   React.useEffect(() => {
      if (clients.length > 0 && !newAssetData.clientId) {
         setNewAssetData(prev => ({ ...prev, clientId: clients[0].id }));
      }
   }, [clients, newAssetData.clientId]);

   React.useEffect(() => {
      const handleGlobalEvent = (e: Event) => {
         const customEvent = e as CustomEvent;
         const { action } = customEvent.detail;
         
         if (action === 'new') {
            createNewDocument('doc');
         } else if (action === 'open') {
            window.location.href = '/document-vault/all';
         } else if (action === 'rename') {
            const input = document.querySelector('input[type="text"][value="' + (activeDocument?.title || 'Untitled Document') + '"]') as HTMLInputElement;
            if (input) {
               input.focus();
               input.select();
            }
         } else if (action === 'trash') {
            // Note: Add trash API call here in the future
            window.location.href = '/document-vault/all';
         }
      };

      document.addEventListener('editor-action', handleGlobalEvent);
      return () => document.removeEventListener('editor-action', handleGlobalEvent);
   }, [activeDocument]);

   // Auto-select newly created document after drafts update
   React.useEffect(() => {
      if (pendingSelectRef.current && drafts.length > 0) {
         const target = drafts.find(d => d.title === pendingSelectRef.current);
         if (target) {
            setActiveDocument({ ...target, content: target.description || target.content || '' });
            pendingSelectRef.current = null;
         }
      }
   }, [drafts]);

   const handleSave = async (docId: string, title: string, content: string) => {
      setIsSaving(true);
      try {
         await updateDocumentMetadata(docId, {
            title,
            description: content,
            content: content
         });
         setActiveDocument((prev: any) => prev ? { ...prev, title, content, description: content } : null);
      } catch (err) {
         console.error(err);
      } finally {
         setIsSaving(false);
      }
   };

   const handleCreateAsset = async () => {
      if (!newAssetData.clientId) {
         alert("Please select a client.");
         return;
      }

      const docTypeMap = { doc: 'google_doc', sheet: 'google_sheet', slide: 'google_slide' };
      const assetTitle = newAssetData.title || `Untitled ${newAssetData.type}`;
      setIsSaving(true);
      try {
         pendingSelectRef.current = assetTitle;
         await createGoogleDoc(
            assetTitle,
            newAssetData.clientId,
            docTypeMap[newAssetData.type],
            newAssetData.folderId
         );
         setShowNewAssetModal(false);
         setNewAssetData({ title: '', type: 'doc', clientId: clients[0]?.id || '', folderId: null });
      } catch (err) {
         console.error(err);
         pendingSelectRef.current = null;
      } finally {
         setIsSaving(false);
      }
   };

   const createNewDocument = (type: 'doc' | 'sheet' | 'slide', folderId: string | null = null) => {
      setNewAssetData(prev => ({ ...prev, type, folderId }));
      setShowNewAssetModal(true);
   };

   const createFolder = () => {
      setNewFolderName("New Folder");
      setShowFolderModal(true);
   };

   const submitCreateFolder = () => {
      if (newFolderName.trim()) {
         storeCreateFolder(newFolderName.trim(), null);
         setShowFolderModal(false);
      }
   };

   const toggleShareClient = (name: string) => {
      setSharedClients(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
   };

   const renderEditor = () => {
      if (!activeDocument) return null;

      const onChange = (newContent: string) => {
         // Optionally debounce save here
         setActiveDocument((prev: any) => ({ ...prev, content: newContent }));
         handleSave(activeDocument.id, activeDocument.title, newContent);
      };

      const onTitleChange = (newTitle: string) => {
         setActiveDocument((prev: any) => ({ ...prev, title: newTitle }));
         handleSave(activeDocument.id, newTitle, activeDocument.content || '');
      };

      if (activeDocument.type === 'doc' || activeDocument.type === 'docx' || activeDocument.type === 'google_doc') {
         return <DocsEditor content={activeDocument.content || ''} onChange={onChange} title={activeDocument.title} onTitleChange={onTitleChange} />;
      }
      if (activeDocument.type === 'sheet' || activeDocument.type === 'xlsx' || activeDocument.type === 'google_sheet') {
         return <SheetsEditor content={activeDocument.content || ''} onChange={onChange} title={activeDocument.title} onTitleChange={onTitleChange} />;
      }
      if (activeDocument.type === 'slide' || activeDocument.type === 'pptx' || activeDocument.type === 'google_slide') {
         return <SlidesEditor content={activeDocument.content || ''} onChange={onChange} title={activeDocument.title} onTitleChange={onTitleChange} />;
      }
      return null;
   };

   const ShareModal = () => (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
      >
         <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-lg bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
         >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
               <div>
                  <h3 className="text-xl font-medium text-white">Share Document</h3>
                  <p className="text-sm text-slate-400 mt-1">Manage who can view or edit this file</p>
               </div>
               <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-all">
                  <X size={20} />
               </button>
            </div>
            {/* Share Modal Content (simplified for brevity) */}
            <div className="p-8 flex justify-end">
               <button onClick={() => setShowShareModal(false)} className="px-6 py-2 bg-white/10 text-white rounded-lg">Done</button>
            </div>
         </motion.div>
      </motion.div>
   );

   return (
      <>
         <WorkspaceShell
            activeDocument={activeDocument}
            documents={drafts}
            folders={storeFolders}
            isLoading={isLoading}
            isSaving={isSaving}
            clients={clients}
            onCreateFolder={createFolder}
            onCreateDocument={createNewDocument}
            onSelectDocument={(doc) => setActiveDocument({ ...doc, content: doc.description || doc.content || '' })}
            onUpdateTitle={(title) => {
               if (activeDocument) {
                  setActiveDocument((prev: any) => ({ ...prev, title }));
                  handleSave(activeDocument.id, title, activeDocument.content || '');
               }
            }}
            onShareClick={() => setShowShareModal(true)}
            renderEditor={renderEditor}
         />

         <AnimatePresence>
            {showShareModal && <ShareModal />}
            {showNewAssetModal && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
               >
                  <motion.div
                     initial={{ scale: 0.95, y: 10 }}
                     animate={{ scale: 1, y: 0 }}
                     className="w-full max-w-xl bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                  >
                     <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                           <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                              New <span className="text-primary">Asset</span>
                           </h2>
                        </div>
                        <button onClick={() => setShowNewAssetModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                           <X size={24} />
                        </button>
                     </div>

                     <div className="p-8 space-y-8">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Title</p>
                           <input
                              type="text"
                              value={newAssetData.title}
                              onChange={(e) => setNewAssetData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Q3 Financial Report"
                              className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 text-white"
                           />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                           {[
                              { type: 'doc', icon: FileText, label: 'Document', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                              { type: 'sheet', icon: Grid3X3, label: 'Spreadsheet', color: 'text-green-400', bg: 'bg-green-500/20' },
                              { type: 'slide', icon: Presentation, label: 'Presentation', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
                           ].map((item) => (
                              <button
                                 key={item.type}
                                 onClick={() => setNewAssetData(prev => ({ ...prev, type: item.type as any }))}
                                 className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${newAssetData.type === item.type
                                       ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(205,255,0,0.1)]'
                                       : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                                    }`}
                              >
                                 <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                    <item.icon size={32} />
                                 </div>
                                 <span className={`text-sm font-bold ${newAssetData.type === item.type ? 'text-white' : 'text-slate-400'}`}>
                                    {item.label}
                                 </span>
                              </button>
                           ))}
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Client Workspace</p>
                           <select
                              value={newAssetData.clientId}
                              onChange={(e) => setNewAssetData(prev => ({ ...prev, clientId: e.target.value }))}
                              className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all text-white appearance-none cursor-pointer"
                           >
                              {clients.map(client => (
                                 <option key={client.id} value={client.id}>{client.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                        <button
                           onClick={() => setShowNewAssetModal(false)}
                           className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleCreateAsset}
                           disabled={isSaving || !newAssetData.title.trim()}
                           className="px-8 py-3 bg-primary hover:bg-lemon text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(205,255,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSaving ? 'Creating...' : 'Create Asset'}
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
            {showFolderModal && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
               >
                  <motion.div
                     initial={{ scale: 0.95, y: 10 }}
                     animate={{ scale: 1, y: 0 }}
                     className="w-full max-w-md bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                  >
                     <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-bold text-white">Create New Folder</h2>
                        <button onClick={() => setShowFolderModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                     <div className="p-8">
                        <input
                           type="text"
                           value={newFolderName}
                           onChange={(e) => setNewFolderName(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') submitCreateFolder();
                           }}
                           placeholder="Folder name"
                           className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 text-white"
                           autoFocus
                        />
                     </div>
                     <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                        <button
                           onClick={() => setShowFolderModal(false)}
                           className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl text-xs font-bold transition-all"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={submitCreateFolder}
                           disabled={!newFolderName.trim()}
                           className="px-6 py-2.5 bg-primary hover:bg-lemon text-slate-900 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           Create
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </>
   );
}
