"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, FileText, ExternalLink, ShieldAlert, History,
  Search, Plus, X, AlertTriangle, CheckCircle, Gavel, Phone
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useDisputeStore } from '@/store/disputeStore';
import { useClientStore } from '@/store/clientStore';
import { useInvoiceStore } from '@/store/invoiceStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

/* ─── Reusable Modal Shell ──────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Create Dispute Modal ──────────────────────────────────────────── */
function CreateDisputeModal() {
  const { t } = useLanguageStore();
  const { createModalOpen, setCreateModalOpen, createDispute } = useDisputeStore();
  const { clients, fetchClients } = useClientStore();
  const { invoices, fetchInvoices } = useInvoiceStore();

  const [form, setForm] = useState({
    client_id: '',
    invoice_id: '',
    dispute_amount: '',
    dispute_reason: '',
    dispute_type: 'inquiry',
    evidence_due_days: '14',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (createModalOpen) {
      fetchClients();
      fetchInvoices();
      setForm({ client_id: '', invoice_id: '', dispute_amount: '', dispute_reason: '', dispute_type: 'inquiry', evidence_due_days: '14' });
      setError('');
      setSuccess(false);
    }
  }, [createModalOpen, fetchClients, fetchInvoices]);

  // Show all invoices — the backend validates the client-invoice relationship
  const clientInvoices = invoices;

  const handleSubmit = async () => {
    if (!form.client_id || !form.invoice_id || !form.dispute_amount || !form.dispute_reason) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await createDispute({
      client_id: form.client_id,
      invoice_id: form.invoice_id,
      dispute_amount: Number(form.dispute_amount),
      dispute_reason: form.dispute_reason,
      dispute_type: form.dispute_type,
    });
    setSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setCreateModalOpen(false), 1200);
    } else {
      setError(result.error || t('disputes.create.error'));
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors";
  const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest";

  return (
    <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title={t('disputes.create.title')}>
      {success ? (
        <div className="py-12 text-center space-y-4">
          <CheckCircle className="mx-auto text-emerald-400" size={48} />
          <p className="text-lg font-black text-white uppercase">{t('disputes.create.success')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="text-rose-500 shrink-0" size={16} />
              <p className="text-xs text-rose-300 font-bold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>{t('disputes.create.select_client')}</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value, invoice_id: '' })} className={inputCls}>
                <option value="">{t('disputes.create.select_client')}...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>{t('disputes.create.select_invoice')}</label>
              <select value={form.invoice_id} onChange={e => setForm({ ...form, invoice_id: e.target.value })} className={inputCls}>
                <option value="">{t('disputes.create.select_invoice')}...</option>
                {clientInvoices.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber || inv.id} — ${inv.totalAmount || inv.amount || 0}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>{t('disputes.create.type')}</label>
              <select value={form.dispute_type} onChange={e => setForm({ ...form, dispute_type: e.target.value })} className={inputCls}>
                <option value="chargeback">{t('disputes.create.type_chargeback')}</option>
                <option value="inquiry">{t('disputes.create.type_inquiry')}</option>
                <option value="refund_request">{t('disputes.create.type_refund')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>{t('disputes.create.amount')}</label>
              <input
                type="number" step="0.01" min="0"
                value={form.dispute_amount}
                onChange={e => setForm({ ...form, dispute_amount: e.target.value })}
                className={inputCls} placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>{t('disputes.create.evidence_days')}</label>
              <input
                type="number" min="1"
                value={form.evidence_due_days}
                onChange={e => setForm({ ...form, evidence_due_days: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>{t('disputes.create.reason')}</label>
            <textarea
              value={form.dispute_reason}
              onChange={e => setForm({ ...form, dispute_reason: e.target.value })}
              className={`${inputCls} min-h-[100px]`}
              placeholder={t('disputes.create.reason')}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Gavel size={18} />
                {t('disputes.create.submit')}
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ─── Dispute Action Modal ──────────────────────────────────────────── */
function DisputeActionModal({ dispute, isOpen, onClose }: {
  dispute: any | null; isOpen: boolean; onClose: () => void;
}) {
  const { t } = useLanguageStore();
  const { performAction } = useDisputeStore();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!dispute) return null;

  const handleAction = async (action: string) => {
    setLoading(true);
    await performAction(dispute.id, action, notes);
    setLoading(false);
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('disputes.actions.title')} — ${dispute.id}`}>
      <div className="space-y-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-white">{dispute.userName}</span>
            <span className="text-lg font-black text-rose-400">${dispute.amount?.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400">{dispute.reason}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-primary/50 focus:outline-none min-h-[80px]"
            placeholder={t('disputes.actions.notes_placeholder')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('resolve_won')}
            disabled={loading}
            className="py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={14} />
            {t('disputes.actions.confirm_resolve_won')}
          </button>
          <button
            onClick={() => handleAction('resolve_lost')}
            disabled={loading}
            className="py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <AlertCircle size={14} />
            {t('disputes.actions.confirm_resolve_lost')}
          </button>
          <button
            onClick={() => handleAction('escalate')}
            disabled={loading}
            className="py-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={14} />
            {t('disputes.actions.confirm_escalate')}
          </button>
          <button
            onClick={() => handleAction('contact_customer')}
            disabled={loading}
            className="py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            {t('disputes.table.contact')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function PaymentDisputesPage() {
  const { t } = useLanguageStore();
  const {
    disputes, statistics, isLoading, fetchDisputes,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    filteredDisputes, setCreateModalOpen, recentActivity, disputeTrends
  } = useDisputeStore();

  const [actionDispute, setActionDispute] = useState<any | null>(null);

  React.useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const displayed = filteredDisputes();

  const filterTabs: { id: 'all' | 'needs_response' | 'under_review' | 'resolved'; label: string }[] = [
    { id: 'all', label: t('disputes.all') },
    { id: 'needs_response', label: t('disputes.needs_response') },
    { id: 'under_review', label: t('disputes.under_review') },
    { id: 'resolved', label: t('disputes.resolved') },
  ];

  const statusColor = (s: string) => {
    if (s === 'open' || s === 'needs_response') return { dot: 'bg-rose-500', text: 'text-rose-500' };
    if (s === 'under_review') return { dot: 'bg-amber-500', text: 'text-amber-500' };
    if (s === 'resolved' || s === 'won') return { dot: 'bg-emerald-500', text: 'text-emerald-500' };
    if (s === 'closed' || s === 'lost') return { dot: 'bg-slate-500', text: 'text-slate-400' };
    return { dot: 'bg-blue-500', text: 'text-blue-500' };
  };

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldAlert size={14} />
              {t('disputes.risk_mitigation')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
               {t('disputes.title')} <span className="text-rose-500 italic">{t('disputes.disputes')}</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
               {t('disputes.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: t('disputes.all'), value: statistics.totalDisputes, color: 'text-white' },
             { label: t('disputes.needs_response'), value: statistics.activeCount, color: 'text-rose-500' },
             { label: t('disputes.resolved'), value: statistics.resolvedCount, color: 'text-emerald-500' },
             { label: 'Win Rate', value: `${statistics.winRate}%`, color: 'text-emerald-500' }
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {isLoading ? '...' : stat.value}
                </p>
             </div>
           ))}
        </div>

        {/* Charts & Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Trends Chart */}
           <div className="lg:col-span-2 bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">{t('disputes.trends_title') || 'Dispute Trends'}</h2>
                    <p className="text-xs text-slate-400">Historical performance over the last 6 months</p>
                 </div>
              </div>
              <div className="flex-1 min-h-0">
                 {disputeTrends && disputeTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[...disputeTrends].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorWin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="month" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Area type="monotone" dataKey="total_disputes" name="Total Disputes" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                          <Area type="monotone" dataKey="win_rate" name="Win Rate (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWin)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest">
                       {isLoading ? 'Loading Trends...' : 'No Trend Data Available'}
                    </div>
                 )}
              </div>
           </div>

           {/* Recent Activity Feed */}
           <div className="bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col h-[400px]">
              <div className="mb-6 flex items-center gap-2 text-rose-500">
                 <History size={16} />
                 <h2 className="text-sm font-black text-white uppercase tracking-widest">{t('disputes.activity_feed') || 'Recent Activity'}</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                 {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                    <div key={activity.activity_id || idx} className="relative pl-6 pb-4 border-l border-white/10 last:border-0 last:pb-0">
                       <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                       <p className="text-[10px] text-slate-500 font-bold mb-1">
                          {new Date(activity.timestamp).toLocaleString()} • {activity.performed_by}
                       </p>
                       <p className="text-sm text-white font-medium">{activity.description}</p>
                       <p className="text-[10px] text-rose-400 font-mono mt-1 uppercase">Ref: {activity.dispute_id}</p>
                    </div>
                 )) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold uppercase tracking-widest">
                       {isLoading ? 'Loading Activity...' : 'No Recent Activity'}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Table Card */}
        <div className="bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Toolbar: filters + search */}
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
             <div className="flex gap-2 text-white flex-wrap">
                {filterTabs.map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setStatusFilter(tab.id)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       statusFilter === tab.id
                         ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                         : 'bg-white/5 hover:bg-white/10 text-slate-400'
                     }`}
                   >
                    {tab.label}
                  </button>
                ))}
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input
                  type="text"
                  placeholder={t('disputes.reference_placeholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-rose-500/50 transition-colors"
                />
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5">
                      <th className="py-6 px-8">{t('disputes.table.dispute_entity')}</th>
                      <th className="py-6 px-8">{t('disputes.table.reason')}</th>
                      <th className="py-6 px-8 text-right">{t('disputes.table.amount')}</th>
                      <th className="py-6 px-8">{t('disputes.table.status')}</th>
                      <th className="py-6 px-8 text-right">{t('disputes.table.deadline')}</th>
                      <th className="py-6 px-8 text-right">{t('disputes.table.actions')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {displayed.length > 0 ? displayed.map((dp) => {
                     const colors = statusColor(dp.status);
                     return (
                     <tr key={dp.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-6 px-8">
                           <div>
                              <p className="text-xs font-mono text-slate-500 mt-1 uppercase">ID: {dp.id}</p>
                              <p className="text-sm font-bold text-white uppercase tracking-tight">{dp.userName}</p>
                              <p className="text-[10px] text-slate-500">Ref: {dp.transactionId}</p>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <p className="text-xs text-slate-400 max-w-xs">{dp.reason}</p>
                        </td>
                        <td className="py-6 px-8 text-right text-lg font-black text-white">
                           ${dp.amount?.toLocaleString()}
                        </td>
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${colors.dot}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>
                                 {dp.status.replace('_', ' ')}
                              </span>
                           </div>
                        </td>
                        <td className="py-6 px-8 text-right">
                           {dp.dueDate ? (
                             <div className="flex flex-col items-end">
                                <p className="text-sm font-bold text-white text-nowrap">{new Date(dp.dueDate).toLocaleDateString()}</p>
                                <p className="text-[9px] font-black uppercase text-rose-500/60">{t('disputes.table.final_deadline')}</p>
                             </div>
                           ) : (
                             <span className="text-xs text-slate-600">—</span>
                           )}
                        </td>
                        <td className="py-6 px-8 text-right">
                           <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActionDispute(dp)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                              >
                                 <FileText size={14} /> {t('disputes.table.evidence')}
                              </button>
                           </div>
                        </td>
                     </tr>
                   )}) : (
                     <tr>
                        <td colSpan={6} className="py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
                          {isLoading ? t('sidebar.loading') || 'Syncing Disputes...' : t('disputes.table.no_disputes') || 'No Disputes Found'}
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Webhook Banner */}
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
           <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500">
              <ShieldAlert size={32} />
           </div>
           <div className="flex-1">
              <h4 className="text-lg font-black text-rose-400 uppercase tracking-tight">{t('disputes.webhooks.title')}</h4>
              <p className="text-sm text-slate-400">{t('disputes.webhooks.desc')}</p>
           </div>
           <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10">
              <History size={16} className="inline mr-2" /> {t('disputes.webhooks.history_btn')}
           </button>
        </div>
      </div>

      {/* FAB — Create Dispute */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-rose-500/50 transition-all"
      >
        <Plus size={20} />
        {t('disputes.create.title')}
      </motion.button>

      {/* Modals */}
      <CreateDisputeModal />
      <DisputeActionModal
        dispute={actionDispute}
        isOpen={!!actionDispute}
        onClose={() => setActionDispute(null)}
      />
    </div>
  );
}
