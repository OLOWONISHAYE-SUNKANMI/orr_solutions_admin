"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpCircle, 
  Download, 
  RotateCcw, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Hash,
  ArrowRight
} from 'lucide-react';
import { useVaultStore, Document, DocumentVersion } from '@/store/vaultStore';

export default function VersionManagementPage() {
  const { documents, isLoading, fetchDocuments } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const allVersions = useMemo(() => {
    const versions: (DocumentVersion & { docTitle: string, docId: string })[] = [];
    documents.forEach(doc => {
      (doc.versions || []).forEach(v => {
        versions.push({ ...v, docTitle: doc.title, docId: doc.id });
      });
    });
    return versions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [documents]);

  const filteredVersions = allVersions.filter(v => 
    (v.docTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.file_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.uploaded_by_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <History size={14} />
              Iterative History
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Version <span className="text-blue-400 italic">Control</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Global oversight of document iterations. Monitor updates, verify file integrity, and manage asset lifecycles across the ecosystem.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search versions by filename or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Version Timeline */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-card/20 border border-white/5 rounded-[32px] p-8 space-y-6"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-5 bg-white/10 rounded w-48" />
                          <div className="h-5 bg-white/5 rounded w-10" />
                        </div>
                        <div className="h-3 bg-white/5 rounded w-64" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-2 bg-white/5 rounded w-16" />
                          <div className="h-3 bg-white/10 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex lg:flex-col justify-end gap-3 shrink-0">
                    <div className="h-12 w-32 bg-white/5 rounded-2xl" />
                    <div className="h-12 w-32 bg-white/10 rounded-2xl" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredVersions.map((version, idx) => (
              <motion.div
                key={`${version.docId}-${version.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card/20 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-[32px] p-8 group transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500">
                        <FileText size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{version.file_name}</h3>
                           <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                             v{version.version_number}
                           </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                          Belongs to: <span className="text-white">{version.docTitle}</span> ({version.docId})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Uploaded By</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                             <User size={12} className="text-blue-400" /> {version.uploaded_by_name}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Timestamp</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                             <Clock size={12} className="text-blue-400" /> {new Date(version.created_at).toLocaleString()}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">File Size</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                             {(version.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Integrity Hash</p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                             <Hash size={10} /> {version.hash}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col justify-end gap-3 shrink-0">
                     <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Download size={16} /> Download
                     </button>
                     <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20">
                        <RotateCcw size={16} /> Restore This
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {filteredVersions.length === 0 && !isLoading && (
           <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                <History size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white">No versions found</h3>
                <p className="text-slate-400 text-sm">Either no documents exist or they only have a single initial version.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
