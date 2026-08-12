"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, User, ArrowRight, ShieldCheck, BarChart3, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';

import { useLanguageStore } from '@/store/languageStore';
import { useProRataStore } from '@/store/proRataStore';

export default function ProRataApprovalsPage() {
  const { t } = useLanguageStore();
  const { requests, statistics, recentDecisions, workflowMetrics, isLoading, fetchRequests, processAction } = useProRataStore();

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, decision: 'approve' | 'reject') => {
    await processAction(id, decision);
  };

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <TrendingUp size={14} />
              {t('pro_rata.precision_control')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
               {t('pro_rata.title')} <span className="text-primary italic">{t('pro_rata.approvals')}</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
               {t('pro_rata.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Total Requests', value: statistics.totalRequestsThisMonth, color: 'text-white' },
             { label: 'Pending Queue', value: statistics.pendingRequests, color: 'text-amber-500' },
             { label: 'Pending Prorata Amount', value: `$${statistics.totalProrataAmountPending.toLocaleString()}`, color: 'text-rose-500' },
             { label: 'Approved Prorata Amount', value: `$${statistics.totalProrataAmountApproved.toLocaleString()}`, color: 'text-emerald-500' }
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {isLoading ? '...' : stat.value}
                </p>
             </div>
           ))}
        </div>

        {/* Charts & Metrics Section */}
        {workflowMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Monthly Trend Chart */}
             <div className="lg:col-span-2 bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-[350px]">
                <div className="mb-4">
                   <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" />
                      Monthly Request Volume
                   </h2>
                   <p className="text-xs text-slate-400">Pro-rata billing adjustment request trends</p>
                </div>
                <div className="flex-1 min-h-0">
                   {workflowMetrics.monthly_trend && workflowMetrics.monthly_trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={workflowMetrics.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                               <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="month" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="requests" name="Requests Filed" stroke="#a3e635" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest">
                         No Trend Data Available
                      </div>
                   )}
                </div>
             </div>

             {/* Requests by Type breakdown */}
             <div className="bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-[350px]">
                <div className="mb-4">
                   <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 size={16} className="text-primary" />
                      Adjustment Category Distribution
                   </h2>
                   <p className="text-xs text-slate-400">Total requests parsed by action category</p>
                </div>
                <div className="flex-1 min-h-0">
                   {workflowMetrics.requests_by_type ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart 
                           data={[
                             { name: 'Upgrade', count: workflowMetrics.requests_by_type.plan_upgrade || 0, color: '#38bdf8' },
                             { name: 'Downgrade', count: workflowMetrics.requests_by_type.plan_downgrade || 0, color: '#fb7185' },
                             { name: 'Adjustment', count: workflowMetrics.requests_by_type.billing_adjustment || 0, color: '#fbbf24' }
                           ]} 
                           layout="vertical"
                           margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                         >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                            <XAxis type="number" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="count" name="Total Requests" radius={[0, 8, 8, 0]}>
                               {[
                                 { color: '#38bdf8' },
                                 { color: '#fb7185' },
                                 { color: '#fbbf24' }
                               ].map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest">
                         No Breakdown Data Available
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
           <h2 className="text-lg font-black text-white uppercase tracking-widest italic -mb-2">
              {t('pro_rata.pending_queue') || 'Active Adjustment Queue'}
           </h2>
          {isLoading ? (
            <div className="py-20 flex justify-center">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col xl:flex-row gap-8 items-start xl:items-center hover:border-primary/30 transition-all group"
                  >
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                             <User size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-white">{request.clientName}</h3>
                             <p className="text-xs text-slate-500">{request.clientEmail}</p>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                             <span className="text-white/40 mr-2">{t('pro_rata.from')}:</span>
                             <span className="font-bold text-white uppercase tracking-wider">{request.currentPlan}</span>
                          </div>
                          <ArrowRight className="text-primary" size={16} />
                          <div className="px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                             <span className="text-primary/60 mr-2">{t('pro_rata.to')}:</span>
                             <span className="font-black text-primary uppercase tracking-wider">{request.newPlan}</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <p className="text-sm text-slate-400 font-medium">
                            <span className="text-white/60 font-black uppercase text-[10px] tracking-widest mr-2">{t('pro_rata.justification')}:</span>
                            {request.reason}
                          </p>
                          <div className="flex items-center gap-2 text-slate-500 text-xs shadow-inner py-1 px-3 bg-black/20 rounded-full">
                             <Clock size={12} />
                             <span>{new Date(request.requestedDate).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
                       <div className="text-right mb-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('pro_rata.adjustment_total')}</p>
                          <p className={`text-3xl font-black tracking-tighter ${request.amount < 0 ? 'text-rose-500' : 'text-primary'}`}>
                             {request.amount < 0 ? '-' : '+'}${Math.abs(request.amount).toLocaleString()}
                          </p>
                       </div>
                       
                       <div className="flex gap-2 w-full xl:w-auto">
                          <button 
                            onClick={() => handleAction(request.id, 'reject')}
                            className="flex-1 xl:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                             {t('pro_rata.reject')}
                          </button>
                          <button 
                             onClick={() => handleAction(request.id, 'approve')}
                             className="flex-1 xl:flex-none px-6 py-3 bg-primary text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-lemon transition-all shadow-xl shadow-primary/10"
                          >
                             {t('pro_rata.approve')}
                          </button>
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                          <ShieldCheck size={12} className="text-emerald-500" />
                          {t('pro_rata.requires_auth')}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {requests.length === 0 && (
                <div className="bg-card/20 backdrop-blur-md border border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle size={32} />
                   </div>
                   <div className="text-center">
                      <p className="text-xl font-black text-white italic uppercase tracking-widest">{t('pro_rata.queue_cleared')}</p>
                      <p className="text-sm text-slate-500">{t('pro_rata.no_pending')}</p>
                   </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Decisions Log */}
        <div className="bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center gap-3">
             <History className="text-primary" size={20} />
             <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Recent Approval Decisions</h3>
                <p className="text-xs text-slate-400">Audit trail of authorized or rejected billing modifications</p>
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5">
                      <th className="py-6 px-8">Client</th>
                      <th className="py-6 px-8">Transition</th>
                      <th className="py-6 px-8 text-right">Adjustment Amount</th>
                      <th className="py-6 px-8">Status</th>
                      <th className="py-6 px-8 text-right">Decided Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                   {recentDecisions.length > 0 ? recentDecisions.map((dec, idx) => (
                      <tr key={dec.request_id || idx} className="hover:bg-white/[0.02] transition-colors">
                         <td className="py-6 px-8">
                            <div>
                               <p className="font-bold text-white uppercase tracking-tight">{dec.client_name}</p>
                               <p className="text-xs text-slate-500 font-mono">{dec.client_email}</p>
                            </div>
                         </td>
                         <td className="py-6 px-8">
                            <div className="flex items-center gap-2">
                               <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400 font-bold uppercase">{dec.current_plan}</span>
                               <ArrowRight className="text-slate-500" size={12} />
                               <span className="text-xs px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary font-bold uppercase">{dec.new_plan}</span>
                            </div>
                         </td>
                         <td className="py-6 px-8 text-right font-black text-white">
                            ${Math.abs(dec.prorata_amount).toLocaleString()}
                         </td>
                         <td className="py-6 px-8">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              dec.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                               {dec.status}
                            </span>
                         </td>
                         <td className="py-6 px-8 text-right text-slate-500 text-xs font-mono">
                            {new Date(dec.decided_at).toLocaleDateString()}
                         </td>
                      </tr>
                   )) : (
                      <tr>
                         <td colSpan={5} className="py-16 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
                            No Billing Adjustment Logs Available
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}
