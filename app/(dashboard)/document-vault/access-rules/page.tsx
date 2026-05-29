"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Settings2,
  Plus,
  ChevronRight,
  Zap,
  Info,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useVaultStore, DocumentAccessRule } from '@/store/vaultStore';

export default function AccessRulesPage() {
  const { documents, fetchDocuments, updateDocumentMetadata, isLoadingDocuments: isLoading } = useVaultStore();
  
  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  const clientFacingDocs = documents.filter(d => d.visibility === 'client');
  const lockedDocs = clientFacingDocs.filter(d => d.accessRule?.type && d.accessRule.type !== 'immediate');
  const immediateDocs = clientFacingDocs.filter(d => !d.accessRule?.type || d.accessRule.type === 'immediate');

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} />
              Governance & Security
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Access <span className="text-primary italic">Rules</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Configure payment-linked access, visibility logic, and unlock conditions for client-facing documents.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[32px] p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                 <Lock size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Locked Assets</p>
              <h4 className="text-3xl font-black text-white">{lockedDocs.length}</h4>
           </div>
           
           <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[32px] p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                 <Unlock size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Immediate Access</p>
              <h4 className="text-3xl font-black text-white">{immediateDocs.length}</h4>
           </div>

           <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[32px] p-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                 <Zap size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rule Efficiency</p>
              <h4 className="text-3xl font-black text-white">98.2%</h4>
           </div>
        </div>

        {/* Rules Table */}
        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
             <h3 className="text-xl font-black uppercase italic">Active <span className="text-primary">Conditions</span></h3>
             <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 italic uppercase tracking-widest">
                  {clientFacingDocs.length} Documents Audited
                </span>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client / Project</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Rule</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-white/5 bg-white/[0.01]">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-36" />
                            <div className="h-3 bg-white/5 rounded w-20" />
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
                          <div className="h-4 bg-white/10 rounded w-28" />
                          <div className="h-3 bg-white/5 rounded w-20" />
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="h-8 w-28 bg-white/5 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  clientFacingDocs.map((doc, idx) => (
                    <motion.tr 
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{doc.title}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">ID: {doc.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-6 px-8">
                         <p className="text-xs font-bold text-white uppercase tracking-tight">{doc.client}</p>
                         <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">{doc.project}</p>
                      </td>

                      <td className="py-6 px-8">
                         {(!doc.accessRule || doc.accessRule.type === 'immediate') ? (
                           <div className="flex items-center gap-2 text-emerald-400">
                              <Unlock size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Public / Immediate</span>
                           </div>
                         ) : (
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-amber-500">
                                 <Lock size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">
                                   {doc.accessRule.type.replace('_', ' ')}
                                 </span>
                              </div>
                              <p className="text-[9px] text-slate-500 font-bold max-w-[200px] leading-relaxed uppercase">
                                 {doc.accessRule.description}
                              </p>
                           </div>
                         )}
                      </td>

                      <td className="py-6 px-8 text-right">
                         <button className="px-4 py-2 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Configure Rule
                         </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard size={24} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black uppercase italic">Payment <span className="text-primary">Gate</span></h4>
                    <p className="text-xs text-slate-400">Create a rule linked to a specific payment transaction.</p>
                 </div>
              </div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                 Deploy Template <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Settings2 size={24} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black uppercase italic">Bulk <span className="text-blue-400">Override</span></h4>
                    <p className="text-xs text-slate-400">Apply a single rule to an entire project or client folder.</p>
                 </div>
              </div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                 Open Bulk Tools <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
