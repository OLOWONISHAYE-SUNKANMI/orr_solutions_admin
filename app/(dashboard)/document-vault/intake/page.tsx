"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Trash2, 
  Plus, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';

import { useVaultStore, Document, ScanStatus } from '@/store/vaultStore';
import { useLanguageStore } from '@/store/languageStore';
import UploadDocumentModal from '../UploadDocumentModal';

export default function IntakeQueuePage() {
  const { t } = useLanguageStore();
  const { documents, fetchDocuments, deleteDocument, isLoading } = useVaultStore();

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const pendingDocs = useMemo(() => {
    return documents.filter(doc => doc.scanStatus === 'scanning');
  }, [documents]);

  const failedDocs = useMemo(() => {
    return documents.filter(doc => doc.scanStatus === 'failed');
  }, [documents]);

  const recentDocs = useMemo(() => {
    return documents
      .filter(doc => doc.scanStatus === 'passed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [documents]);

  return (
    <div className="min-h-screen pb-24 text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Upload size={14} />
              Ingestion Pipeline
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Upload & <span className="text-primary italic">Intake Queue</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Isolate the ingestion process. Monitor live malware scans, resolve failed uploads, and initialize batch assets for repository entry.
            </p>
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.1em] hover:bg-lemon transition-all shadow-xl shadow-primary/20 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Initialize Batch Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Scanning Queue */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Clock size={14} className="text-amber-500" /> Active Scans
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">{pendingDocs.length} Pending</span>
             </div>

             <div className="space-y-4">
                {isLoading ? (
                   Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} className="animate-pulse bg-card/40 border border-white/10 rounded-[32px] p-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10" />
                            <div className="space-y-2">
                               <div className="h-4 bg-white/10 rounded w-28" />
                               <div className="h-3 bg-white/5 rounded w-16" />
                            </div>
                         </div>
                         <div className="space-y-2 text-right">
                            <div className="h-3 bg-white/10 rounded w-24 ml-auto" />
                            <div className="h-1 bg-white/5 rounded-full w-32 ml-auto" />
                         </div>
                      </div>
                   ))
                ) : (
                   <AnimatePresence mode='popLayout'>
                      {pendingDocs.map(doc => (
                         <motion.div 
                           key={doc.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex items-center justify-between group"
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
                                  <Loader2 size={24} className="animate-spin" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-white uppercase">{doc.title}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc.client}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Scanning for Malware</p>
                               <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    className="h-full bg-amber-500" 
                                  />
                               </div>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                )}
                
                {!isLoading && pendingDocs.length === 0 && (
                   <div className="py-20 bg-white/[0.02] border border-white/5 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 text-slate-600">
                      <CheckCircle2 size={48} className="opacity-10 text-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">All Ingestion Scans Complete</p>
                   </div>
                )}
             </div>
          </section>

          {/* Action Required & Recent */}
          <div className="space-y-8">
             {/* Failed Uploads */}
             <section className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-500" /> Blocked Assets
                   </h2>
                </div>
                
                <div className="space-y-4">
                   {failedDocs.map(doc => (
                      <div key={doc.id} className="bg-rose-500/5 border border-rose-500/20 rounded-[32px] p-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                               <ShieldAlert size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-white uppercase">{doc.title}</p>
                               <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest italic">Heuristic Match Detected</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl border border-white/10 transition-all">
                               <RefreshCcw size={16} />
                            </button>
                            <button 
                              onClick={() => deleteDocument(doc.id)}
                              className="p-3 bg-white/5 hover:bg-rose-500/20 text-rose-500 rounded-2xl border border-white/10 transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   ))}
                   {failedDocs.length === 0 && (
                      <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center gap-4">
                         <ShieldCheck className="text-emerald-500" size={24} />
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">No Security Flags Triggered</p>
                      </div>
                   )}
                </div>
             </section>

              {/* Recent Intake Success */}
              <section className="space-y-6">
                 <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Recent Ingestion
                 </h2>
                 <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="divide-y divide-white/5">
                       {isLoading ? (
                          Array.from({ length: 3 }).map((_, idx) => (
                             <div key={idx} className="animate-pulse p-4 flex items-center gap-3">
                                <div className="w-4 h-4 bg-white/10 rounded" />
                                <div className="space-y-2 flex-1">
                                   <div className="h-3 bg-white/10 rounded w-2/3" />
                                   <div className="h-2 bg-white/5 rounded w-1/4" />
                                </div>
                             </div>
                          ))
                       ) : (
                          recentDocs.map(doc => (
                             <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-3">
                                   <FileText size={16} className="text-slate-500" />
                                   <div>
                                      <p className="text-xs font-black text-white uppercase">{doc.title}</p>
                                      <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(doc.createdAt).toLocaleTimeString()}</p>
                                   </div>
                                </div>
                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                   <ArrowRight size={16} />
                                </button>
                             </div>
                          ))
                       )}
                    </div>
                 </div>
              </section>
          </div>
        </div>
      </div>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
