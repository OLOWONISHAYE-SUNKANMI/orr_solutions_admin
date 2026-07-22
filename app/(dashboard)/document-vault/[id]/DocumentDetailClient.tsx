"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
   Loader2,
   ChevronLeft,
   Zap,
   Activity,
   Save,
   FileCode,
   Layers
} from 'lucide-react';
import { useVaultStore, Document, Visibility } from '@/store/vaultStore';
import Link from 'next/link';

export default function DocumentDetailClient({ params }: { params: { id: string } }) {
   const { id } = params;
   const { documents, fetchDocumentById, updateDocumentMetadata, uploadNewVersion, isLoadingDocuments: isLoading } = useVaultStore();
   
   React.useEffect(() => {
      fetchDocumentById(id);
   }, [id, fetchDocumentById]);

   const doc = documents.find(d => d.id.toString() === id.toString());
   
   const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'audit' | 'ai'>('details');
   const [feedbackInput, setFeedbackInput] = useState('');
   const [isUploadingVersion, setIsUploadingVersion] = useState(false);

   if (!doc && isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center text-white">
            <div className="text-center space-y-4">
               <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
               <p className="text-sm font-black uppercase tracking-widest text-slate-500">Retrieving Asset...</p>
            </div>
         </div>
      );
   }

   if (!doc) {
      return (
         <div className="min-h-screen flex items-center justify-center text-white">
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black italic uppercase">Asset <span className="text-primary">Not Found</span></h2>
               <p className="text-slate-500 text-sm max-w-xs mx-auto">The requested document could not be located in the current repository stack.</p>
               <Link href="/document-vault/all" className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-primary transition-all">Return to Vault</Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen pb-24 text-white relative">
         {/* Hero Background */}
         <div className="fixed inset-0 bg-background -z-10">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-4">
               <Link href="/document-vault/all" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 transition-all">
                  <ChevronLeft size={20} />
               </Link>
               <div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                     <FileText size={12} /> Vault / {doc.category}
                  </div>
                  <h1 className="text-2xl font-black uppercase italic tracking-tight">{doc.title}</h1>
               </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: Asset Overview */}
               <div className="lg:col-span-2 space-y-8">
                  {/* Status Bar */}
                  <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-wrap items-center gap-12 shadow-2xl">
                     <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Asset Status</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <p className="text-xs font-black text-white uppercase tracking-tighter">Verified & Active</p>
                        </div>
                     </div>
                     <div className="h-10 w-px bg-white/5 hidden md:block" />
                     <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Current Version</p>
                        <p className="text-xs font-black text-white uppercase tracking-tighter">v{doc.currentVersion}.0.4</p>
                     </div>
                     <div className="h-10 w-px bg-white/5 hidden md:block" />
                     <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Visibility Layer</p>
                        <div className="flex items-center gap-2">
                           {doc.visibility === 'client' ? <Globe size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-amber-500" />}
                           <p className="text-xs font-black text-white uppercase tracking-tighter">{doc.visibility === 'client' ? 'Client Facing' : 'Internal Only'}</p>
                        </div>
                     </div>
                     <div className="h-10 w-px bg-white/5 hidden md:block" />
                     <div className="flex-1 flex justify-end">
                        <button 
                           onClick={() => {
                              const isMock = doc.google_drive_id?.startsWith('mock_') || doc.link?.includes('mock_');
                              if (isMock) {
                                 alert("This is a mock document generated for preview purposes and cannot be downloaded.");
                                 return;
                              }

                              const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                              let url = doc.link;
                              let filename = doc.title;
                              if (doc.versions && doc.versions.length > 0) {
                                 const latestVersion = doc.versions[0];
                                 url = latestVersion.file?.startsWith('http') ? latestVersion.file : `${apiBase}${latestVersion.file}`;
                                 filename = latestVersion.file_name || doc.title;
                              } else if (url && !url.startsWith('http')) {
                                 url = `${apiBase}${url}`;
                              }
                              
                              if (url && url.includes('docs.google.com')) {
                                 window.open(url, '_blank', 'noopener,noreferrer');
                                 return;
                              }
                              
                              if (url) {
                                 const a = document.createElement('a');
                                 a.href = url;
                                 a.download = filename;
                                 a.target = '_blank';
                                 a.rel = 'noopener noreferrer';
                                 document.body.appendChild(a);
                                 a.click();
                                 document.body.removeChild(a);
                              }
                           }}
                           className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lemon transition-all shadow-lg shadow-primary/20"
                        >
                           <Download size={16} /> Download Source
                        </button>
                     </div>
                  </div>

                  {/* Tabs & Content */}
                  <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                     <div className="flex px-8 border-b border-white/5 bg-white/5">
                        {[
                           { id: 'details', label: 'Configuration', icon: Settings2 },
                           { id: 'versions', label: 'History', icon: History },
                           { id: 'audit', label: 'Activity', icon: Activity },
                           { id: 'ai', label: 'Gemini AI', icon: Zap }
                        ].map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex items-center gap-2 px-6 py-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                           >
                              <tab.icon size={14} />
                              {tab.label}
                              {activeTab === tab.id && (
                                 <motion.div layoutId="activeDetailTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                              )}
                           </button>
                        ))}
                     </div>

                     <div className="p-8">
                        {activeTab === 'details' && (
                           <div className="space-y-12">
                              {/* Metadata Grid */}
                              <section className="space-y-6">
                                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <FileCode size={14} /> Structural Metadata
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 rounded-3xl p-8 border border-white/5">
                                    <div className="space-y-4">
                                       <div className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Document Title</label>
                                          <input type="text" defaultValue={doc.title} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary/50" />
                                       </div>
                                       <div className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Description</label>
                                          <textarea defaultValue={doc.description} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary/50 min-h-[100px]" />
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Client</label>
                                             <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-white italic">{doc.client}</div>
                                          </div>
                                          <div className="space-y-1.5">
                                             <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Category</label>
                                             <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary/50 appearance-none">
                                                <option>{doc.category}</option>
                                                <option>Legal</option>
                                                <option>Financial</option>
                                                <option>Operations</option>
                                             </select>
                                          </div>
                                       </div>
                                       <div className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Project Cluster</label>
                                          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-blue-400">{doc.project}</div>
                                       </div>
                                    </div>
                                 </div>
                              </section>

                              {/* Access Rule Logic */}
                              <section className="space-y-6">
                                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Lock size={14} /> Governance Logic
                                 </h3>
                                 <div className={`p-8 rounded-[32px] border flex flex-col md:flex-row justify-between items-center gap-8 ${doc.accessRule.type === 'immediate' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
                                    <div className="flex gap-6 items-center">
                                       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${doc.accessRule.type === 'immediate' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                          {doc.accessRule.type === 'immediate' ? <ShieldCheck size={32} /> : <Lock size={32} />}
                                       </div>
                                       <div>
                                          <h4 className="text-xl font-black text-white uppercase italic">{doc.accessRule.type.replace('_', ' ')}</h4>
                                          <p className="text-sm text-slate-500 mt-1 max-w-md">{doc.accessRule.description}</p>
                                       </div>
                                    </div>
                                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                       Reconfigure Rules
                                    </button>
                                 </div>
                              </section>
                           </div>
                        )}

                        {activeTab === 'versions' && (
                           <div className="space-y-10">
                              <div className="flex justify-between items-center bg-blue-500/5 border border-blue-500/10 border-dashed p-8 rounded-[32px]">
                                 <div>
                                    <h4 className="text-lg font-black text-white uppercase italic">Deploy Revision</h4>
                                    <p className="text-xs text-slate-500 mt-1">Upload a new version to the Google Drive stack.</p>
                                 </div>
                                 <button className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20">
                                    <Plus size={16} /> New Revision
                                 </button>
                              </div>

                              <div className="space-y-6">
                                 {doc.versions.map((v, i) => (
                                    <div key={v.id} className="relative pl-10 border-l-2 border-white/5 pb-10 last:pb-0">
                                       <div className={`absolute left-0 -translate-x-[7px] w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-primary border-primary' : 'bg-slate-800 border-white/10'}`} />
                                       <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-white/20 transition-all">
                                          <div className="space-y-2">
                                             <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-white uppercase">v{v.version_number}.0</span>
                                                {i === 0 && <span className="text-[8px] font-black bg-primary text-slate-900 px-2 py-0.5 rounded uppercase tracking-widest">Current</span>}
                                             </div>
                                             <p className="text-xs text-slate-400">{v.file_name}</p>
                                             <div className="flex gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(v.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><User size={10} /> {v.uploaded_by_name}</span>
                                             </div>
                                          </div>
                                          <div className="flex gap-2">
                                             <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all">
                                                <Download size={18} />
                                             </button>
                                             <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all">
                                                <ExternalLink size={18} />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {activeTab === 'ai' && (
                           <div className="space-y-8 py-10 flex flex-col items-center text-center">
                              <div className="w-24 h-24 rounded-[40px] bg-primary/10 flex items-center justify-center text-primary relative">
                                 <div className="absolute inset-0 bg-primary/10 rounded-[40px] animate-ping opacity-20" />
                                 <Zap size={48} />
                              </div>
                              <div className="max-w-md space-y-4">
                                 <h3 className="text-3xl font-black italic uppercase">Gemini AI <span className="text-primary">Intelligence</span></h3>
                                 <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                    Analyze this document context to generate summaries, identify risks, or extract key action items for the client.
                                 </p>
                              </div>
                              <div className="flex gap-4">
                                 <button className="px-8 py-4 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-lemon transition-all shadow-lg shadow-primary/20">
                                    Generate Summary
                                 </button>
                                 <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Identify Risks
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Column: Sidebar Insights */}
               <div className="space-y-8">
                  {/* Health Card */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] p-8 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                           <ShieldCheck size={28} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure Asset</span>
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-black text-white uppercase italic">Malware Scan Passed</h4>
                        <p className="text-xs text-emerald-500/60 font-medium">Verified by Enterprise Security Layer</p>
                     </div>
                     <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                        <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest">Last Scan: Today 14:20</p>
                        <Activity size={14} className="text-emerald-500/40" />
                     </div>
                  </div>

                  {/* Activity Stream */}
                  <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-6">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={14} /> Quick History
                     </h3>
                     <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="flex gap-4">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                                 <Activity size={14} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-white uppercase italic tracking-tight">Metadata Update</p>
                                 <p className="text-[9px] text-slate-500 font-bold mt-0.5">By Admin Sarah • 2h ago</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     <Link href="/document-vault/audit" className="block text-center py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">
                        Full Audit Trail
                     </Link>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-[40px] p-8 space-y-6">
                     <div className="flex items-center gap-3 text-rose-500">
                        <ShieldAlert size={24} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Destructive Actions</h4>
                     </div>
                     <button className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Permanently Delete Asset
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Sticky Save Bar */}
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-card/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <p className="text-[10px] font-black text-white uppercase tracking-widest">Unsaved Changes Detected</p>
            </div>
            <div className="flex gap-2">
               <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Discard</button>
               <button className="px-6 py-2 bg-primary text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lemon transition-all flex items-center gap-2">
                  <Save size={14} /> Commit Changes
               </button>
            </div>
         </div>
      </div>
   );
}
