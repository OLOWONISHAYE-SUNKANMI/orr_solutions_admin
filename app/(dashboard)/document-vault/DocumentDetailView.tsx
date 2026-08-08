"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X,
   History,
   ShieldCheck,
   Lock,
   MessageSquare,
   Settings2,
   Download,
   Trash2,
   FileText,
   Clock,
   ArrowUpRight,
   Plus,
   Globe,
   EyeOff,
   Send,
   User,
   ExternalLink,
   ShieldAlert,
   Loader2
} from 'lucide-react';
import { useVaultStore, Document, Visibility } from '@/store/vaultStore';

interface DocumentDetailViewProps {
   doc: Document;
   onClose: () => void;
}

export default function DocumentDetailView({ doc, onClose }: DocumentDetailViewProps) {
   const { updateDocumentMetadata, uploadNewVersion, markAsReviewed, isLoadingDocuments: isLoading } = useVaultStore();
   const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'feedback'>('details');
   const [feedbackInput, setFeedbackInput] = useState('');

   const [isUploadingVersion, setIsUploadingVersion] = useState(false);

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setIsUploadingVersion(true);
         setTimeout(async () => {
            await uploadNewVersion(doc.id, file, 'Current Admin');
            setIsUploadingVersion(false);
         }, 1500);
      }
   };

   const handleSendFeedback = (e: React.FormEvent) => {
      e.preventDefault();
      if (!feedbackInput.trim()) return;
      // addFeedback(doc.id, 'Admin Portal', feedbackInput);
      setFeedbackInput('');
   };

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={onClose}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-2xl h-full bg-card border-l border-white/10 shadow-2xl flex flex-col"
            >
               {/* Header */}
               <div className="p-8 border-b border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                        <FileText size={32} />
                     </div>
                     <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"
                     >
                        <X size={24} />
                     </button>
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{doc.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                     <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-widest">
                        <ShieldCheck size={12} /> Scan Result: {doc.scanStatus}
                     </div>
                     <div className="w-1 h-1 rounded-full bg-slate-700" />
                     <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">ID: {doc.id}</div>
                  </div>
               </div>

               {/* Tab Navigation */}
               <div className="flex px-8 border-b border-white/5">
                  {[
                     { id: 'details', label: 'Overview & Rules', icon: Settings2 },
                     { id: 'versions', label: 'Version Control', icon: History },
                     { id: 'feedback', label: 'Audit & Feedback', icon: MessageSquare }
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                           }`}
                     >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                           <motion.div layoutId="activeVaultTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                     </button>
                  ))}
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-8">
                  {activeTab === 'details' && (
                     <div className="space-y-10">
                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Structural Metadata</h3>
                           <div className="grid grid-cols-2 gap-8">
                              <div>
                                 <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Assigned Client</p>
                                 <p className="text-sm font-black text-white">{doc.client}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Project Cluster</p>
                                 <p className="text-sm font-black text-blue-400">{doc.project}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Lifecycle Category</p>
                                 <p className="text-sm font-black text-white">{doc.category}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Created At</p>
                                 <p className="text-sm font-black text-slate-400">{new Date(doc.createdAt).toLocaleString()}</p>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Access & Unlock Logic</h3>
                           <div className={`p-6 rounded-[24px] border ${doc.accessRule.type === 'immediate' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
                              <div className="flex justify-between items-start">
                                 <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${doc.accessRule.type === 'immediate' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                       {doc.accessRule.type === 'immediate' ? <ShieldCheck size={24} /> : <Lock size={24} />}
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-white uppercase">{doc.accessRule.type.replace('_', ' ')} Access</p>
                                       <p className="text-xs text-slate-500 mt-1">{doc.accessRule.description}</p>
                                       {doc.accessRule.linkedId && (
                                          <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded w-fit">
                                             Linked ID: {doc.accessRule.linkedId} <ArrowUpRight size={10} />
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 <button className="text-[10px] font-black uppercase text-primary hover:underline">Change Logic</button>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Privacy Control</h3>
                           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 {doc.visibility === 'client' ? (
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Globe size={20} /></div>
                                 ) : (
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><EyeOff size={20} /></div>
                                 )}
                                 <div>
                                    <p className="text-sm font-bold text-white uppercase">{doc.visibility === 'client' ? 'Client Facing' : 'Internal ORR Only'}</p>
                                    <p className="text-[10px] text-slate-500">Currently visible to {doc.visibility === 'client' ? 'authorized client users' : 'ORR Administrators only'}</p>
                                 </div>
                              </div>
                              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10 transition-colors">Toggle</button>
                           </div>
                        </section>

                        {doc.is_ai_generated && !doc.is_ai_reviewed && (
                           <section className="space-y-4">
                              <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest border-b border-purple-500/20 pb-2">AI Review Required</h3>
                              <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><FileText size={20} /></div>
                                    <div>
                                       <p className="text-sm font-bold text-white uppercase">AI Generated - Not Reviewed</p>
                                       <p className="text-[10px] text-slate-500">This document is a draft generated by AI and needs human verification.</p>
                                    </div>
                                 </div>
                                 <button onClick={() => markAsReviewed(doc.id)} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-[10px] text-purple-300 font-black uppercase tracking-widest rounded-lg transition-colors">Mark as Reviewed</button>
                              </div>
                           </section>
                        )}
                     </div>
                  )}

                  {activeTab === 'versions' && (
                     <div className="space-y-8">
                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 border-dashed">
                           <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">Deploy New Version</p>
                              <p className="text-xs text-slate-500 mt-1">Replacing current file with updated data.</p>
                           </div>
                           <label className="cursor-pointer">
                              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploadingVersion} />
                              <div className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isUploadingVersion ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary text-slate-900 hover:bg-lemon'}`}>
                                 {isUploadingVersion ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                 {isUploadingVersion ? 'Uploading...' : 'New Version'}
                              </div>
                           </label>
                        </div>

                        <div className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Version Lineage</h3>
                           {doc.versions.map((v, i) => (
                              <div key={v.id} className="relative pl-8 border-l border-white/5 pb-8 last:pb-0">
                                 <div className={`absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-primary border-primary animate-pulse shadow-[0_0_10px_rgba(14,194,119,0.5)]' : 'bg-slate-800 border-white/10'}`} />
                                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start">
                                       <div>
                                          <div className="flex items-center gap-2 mb-1">
                                             <span className="text-xs font-black text-white uppercase">Version {v.version_number}</span>
                                             {i === 0 && <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest">Active</span>}
                                          </div>
                                          <p className="text-xs text-slate-400 mb-3">{v.file_name}</p>
                                          <div className="flex flex-wrap gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                             <div className="flex items-center gap-1.5"><Clock size={10} /> {new Date(v.created_at).toLocaleString()}</div>
                                             <div className="flex items-center gap-1.5"><User size={10} /> {v.uploaded_by_name}</div>
                                             <div className="flex items-center gap-1.5"><ShieldCheck size={10} /> {Math.round(v.file_size / 1024 / 1024 * 100) / 100} MB</div>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button 
                                             onClick={() => {
                                                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
                                                const url = v.file?.startsWith('http') ? v.file : `${apiBase}${v.file}`;
                                                
                                                // Create a temporary anchor element to trigger download
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = v.file_name || 'document';
                                                a.target = '_blank';
                                                a.rel = 'noopener noreferrer';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                             }}
                                             className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                                          >
                                             <Download size={16} />
                                          </button>
                                          <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/20 transition-all shadow-sm">
                                             <ExternalLink size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeTab === 'feedback' && (
                     <div className="h-full flex flex-col space-y-8">
                        <div className="flex-1 space-y-6">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Client Communication & Audit</h3>
                           {doc.feedback && doc.feedback.length > 0 ? (
                              doc.feedback.map(f => (
                                 <div key={f.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                       <p className="text-xs font-black text-primary uppercase tracking-widest">{f.author}</p>
                                       <p className="text-[9px] text-slate-600 font-bold">{new Date(f.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed italic">{f.content}</p>
                                 </div>
                              ))
                           ) : (
                              <div className="py-20 flex flex-col items-center gap-4 text-slate-600">
                                 <MessageSquare size={48} className="opacity-20" />
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">No feedback records for this asset.</p>
                              </div>
                           )}
                        </div>

                        <form onSubmit={handleSendFeedback} className="pt-8 border-t border-white/5 relative">
                           <textarea
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              placeholder="Add internal note or respond to client feedback..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none"
                           />
                           <button
                              type="submit"
                              className="absolute bottom-6 right-4 p-3 bg-primary text-slate-900 rounded-xl hover:bg-lemon transition-all shadow-lg shadow-primary/20"
                           >
                              <Send size={18} />
                           </button>
                        </form>
                     </div>
                  )}
               </div>

               {/* Bottom Actions */}
               <div className="p-8 border-t border-white/5 bg-slate-900/30 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                     <Trash2 size={16} /> Archive Repository
                  </button>
                  <div className="flex gap-4">
                     <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global Status</p>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                           <p className="text-[10px] font-black text-white uppercase tracking-widest">Synced with Workspace</p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </AnimatePresence>
   );
}

