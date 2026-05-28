"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  FileLock2, 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Clock, 
  History,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Download,
  Settings2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useVaultStore, Document } from '@/store/vaultStore';
import DocumentDetailView from '@/app/(dashboard)/document-vault/DocumentDetailView';

export default function InternalDocumentsPage() {
  const { documents, isLoading, fetchDocuments } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const internalDocs = documents.filter(doc => 
    doc.visibility === 'internal' && 
    ((doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
     (doc.client || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldAlert size={14} />
              ORR-Exclusive Layer
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Internal <span className="text-amber-500 italic">Documents</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
               Confidential assets hidden from the client portal. Use for working files, internal audits, and compliance drafts.
            </p>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10">
            <Plus size={18} />
            Add Internal File
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-6 flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle size={28} />
           </div>
           <div className="flex-1">
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Security Protocol Active</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                 All documents in this view are strictly restricted to ORR Solutions personnel. Sharing these links externally will trigger a security audit event.
              </p>
           </div>
           <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <UserCheck size={12} /> Encrypted
           </div>
        </div>

        {/* Controls */}
        <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search internal archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidential Document</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Context</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Version Tracking</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-white/5 bg-white/[0.01]">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                          <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-48" />
                            <div className="h-3 bg-white/5 rounded w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-24" />
                          <div className="h-3 bg-white/5 rounded w-16" />
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-20" />
                          <div className="h-3 bg-white/5 rounded w-16" />
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="h-10 w-40 bg-white/5 rounded-2xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  internalDocs.map((doc, idx) => (
                    <motion.tr 
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-amber-500/[0.02] transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 transition-all duration-300">
                            <FileLock2 size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors uppercase italic">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-[0.1em]">Classified</span>
                               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{doc.category}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-6 px-8">
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{doc.client}</p>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">{doc.project}</p>
                      </td>

                      <td className="py-6 px-8">
                         <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-white uppercase italic">Version {doc.currentVersion}</p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                               <Clock size={10} /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                            </div>
                         </div>
                      </td>

                      <td className="py-6 px-8 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                               onClick={() => setSelectedDoc(doc)}
                               className="p-3 bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                               title="View Details"
                            >
                               <Eye size={18} />
                            </button>
                            <button className="p-3 bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-all" title="Download Asset">
                               <Download size={18} />
                            </button>
                            <button className="p-3 bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-2xl transition-all" title="Configuration">
                               <Settings2 size={18} />
                            </button>
                            <button className="p-3 bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all" title="Archive Asset">
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {internalDocs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center text-slate-700">
                <FileLock2 size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white">No internal documents found</h3>
                <p className="text-slate-400 text-sm">All working files are currently set to client-facing or haven't been created.</p>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
         {selectedDoc && (
            <DocumentDetailView 
               doc={selectedDoc} 
               onClose={() => setSelectedDoc(null)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}
