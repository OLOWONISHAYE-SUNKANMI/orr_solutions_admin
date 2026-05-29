"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  Trash2, 
  Settings2,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useVaultStore, AuditLog } from '@/store/vaultStore';

export default function AuditLogsPage() {
  const { auditLogs, isLoading, fetchActivity } = useVaultStore();

  React.useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    (log.item || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.performedBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'upload': return <Upload size={14} className="text-emerald-400" />;
      case 'delete': return <Trash2 size={14} className="text-rose-400" />;
      case 'metadata_update': return <Settings2 size={14} className="text-blue-400" />;
      case 'version_add': return <RefreshCw size={14} className="text-amber-400" />;
      case 'visibility_change': return <Activity size={14} className="text-purple-400" />;
      default: return <FileText size={14} className="text-slate-400" />;
    }
  };

  const getActionBadge = (action: AuditLog['action']) => {
     const colors: Record<string, string> = {
        upload: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        delete: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        metadata_update: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        version_add: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        visibility_change: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        unlock: 'bg-primary/10 text-primary border-primary/20',
        download: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
     };
     return (
        <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-[0.2em] ${colors[action] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
           {action.replace('_', ' ')}
        </span>
     );
  };

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} />
              Immutable Audit Trail
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Activity <span className="text-primary italic">Logs</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Real-time monitoring of document lifecycles, access events, and administrative overrides across the entire workspace.
            </p>
          </div>

          <div className="flex gap-4">
             <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-white/10 transition-all">
               <Calendar size={18} />
               Export CSV
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by admin, document, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
             <select className="flex-1 lg:flex-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none">
                <option>All Actions</option>
                <option>Uploads</option>
                <option>Deletions</option>
                <option>Access</option>
             </select>
             <select className="flex-1 lg:flex-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
             </select>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Timeline</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Administrator</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Context</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-white/5 bg-white/[0.01]">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/10" />
                          <div className="space-y-2">
                            <div className="h-3.5 bg-white/10 rounded w-28" />
                            <div className="h-2.5 bg-white/5 rounded w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10" />
                          <div className="h-3 bg-white/10 rounded w-24" />
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-white/10 rounded" />
                          <div className="h-3 bg-white/10 rounded w-32" />
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="h-3.5 bg-white/5 rounded w-48 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredLogs.map((log, idx) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-6 px-8">
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                  {getActionIcon(log.action)}
                               </div>
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  {getActionBadge(log.action)}
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                     {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                               </div>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                  {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                               </p>
                            </div>
                         </div>
                      </td>

                      <td className="py-6 px-8">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                               {(log.performedBy || 'U').split(' ').map(n => n[0]).join('')}
                            </div>
                            <p className="text-xs font-black text-white uppercase italic tracking-tight">{log.performedBy}</p>
                         </div>
                      </td>

                      <td className="py-6 px-8">
                         <div className="flex items-center gap-2">
                            <FileText size={14} className="text-slate-500" />
                            <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">{log.item}</p>
                         </div>
                      </td>

                      <td className="py-6 px-8 text-right">
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[250px] ml-auto">
                            {log.details}
                         </p>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLogs.length === 0 && (
           <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                 <Zap size={40} className="text-primary relative z-10" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase italic">Zero Anomalies Detected</h3>
                 <p className="text-slate-500 text-sm max-w-sm mx-auto">No activity logs matching your current filters. The system is operating within normal parameters.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
