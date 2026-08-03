"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  History, 
  Plus, 
  Search, 
  ShieldCheck, 
  Download, 
  Calendar, 
  Filter, 
  Eye, 
  Lock, 
  Unlock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useWalletStore, TransactionType, SystemEvent } from '@/store/walletStore';

import { useLanguageStore } from '@/store/languageStore';
import { useIsSuperAdmin } from '@/lib/rbac/hooks';

export default function WalletManager() {
  const { t, formatCurrency } = useLanguageStore();
  const isSuperAdmin = useIsSuperAdmin();
  const { wallets, transactions, systemEvents, processRefund, exportTransactions, openBalanceModal } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'balances' | 'history' | 'events'>('balances');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  const filteredWallets = (Array.isArray(wallets) ? wallets : []).filter(w => 
    w.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesDate = (!dateRange.start || t.timestamp >= dateRange.start) && 
                        (!dateRange.end || t.timestamp <= dateRange.end);
    return matchesSearch && matchesType && matchesDate;
  });

  const handleExport = () => {
    const csvContent = exportTransactions();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header and Switches */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {[
            { id: 'balances', label: t('wallet.tabs.balances'), icon: Wallet },
            { id: 'history', label: t('wallet.tabs.ledger'), icon: History },
            { id: 'events', label: t('wallet.tabs.events'), icon: ShieldCheck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder={t('wallet.filters.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary transition-all"
          >
            <Download size={16} />
            {t('wallet.filters.export_audit')}
          </button>
        </div>
      </div>

      {/* Advanced Filters (Sticky for Ledger) */}
      {activeTab === 'history' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10"
        >
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('wallet.filters.transaction_type')}</label>
            <div className="flex gap-1.5">
              {['all', 'credit', 'debit', 'refund'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all border ${
                    typeFilter === type ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('wallet.filters.date_range')}</label>
            <div className="flex gap-2 items-center">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] text-white outline-none focus:border-primary/50"
              />
              <span className="text-slate-600">{t('wallet.filters.to')}</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] text-white outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex items-end pb-0.5">
            <button 
              onClick={() => { setDateRange({start: '', end: ''}); setTypeFilter('all'); }}
              className="w-full py-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
            >
              {t('wallet.filters.reset')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'balances' ? (
            <motion.div 
              key="balances"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
            >
              {filteredWallets.length > 0 ? filteredWallets.map((wallet) => (
                <div key={wallet.userId} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Wallet size={80} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xl font-black text-white">{wallet.userName}</h4>
                      <p className="text-xs text-slate-500">{wallet.userEmail}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('dashboard.wallet_balance')}</p>
                      <p className="text-3xl font-black text-emerald-400">
                        {isSuperAdmin ? formatCurrency(wallet.balance) : "[RESTRICTED]"}
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <div className="flex gap-2 pt-2">
                        <button
                           onClick={() => openBalanceModal(wallet.userId)}
                           className="flex-1 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-lemon transition-colors shadow-lg shadow-primary/10"
                        >                           {t('wallet.table.adjust_balance')}
                        </button>
                        <button className="px-4 bg-white/5 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <History size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                  No wallets found
                </div>
              )}
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="py-6 px-8 whitespace-nowrap">{t('wallet.table.tx_id')}</th>
                    <th className="py-6 px-8 whitespace-nowrap">{t('wallet.table.action_type')}</th>
                    <th className="py-6 px-8 text-right whitespace-nowrap">{t('wallet.table.impact')}</th>
                    <th className="py-6 px-8 whitespace-nowrap">{t('wallet.table.status_events')}</th>
                    <th className="py-6 px-8 text-right whitespace-nowrap">{t('wallet.table.management')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-xl bg-white/5 text-slate-500 group-hover:text-primary transition-colors border border-white/10">
                              <FileText size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-mono text-slate-500 mb-0.5">{tx.id}</p>
                              <p className="text-sm font-bold text-white leading-none">{tx.userName}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{tx.description}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${
                            tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            tx.type === 'debit' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {tx.type === 'credit' ? <ArrowUpRight size={14} /> : 
                             tx.type === 'debit' ? <ArrowDownLeft size={14} /> : 
                             <RefreshCcw size={14} />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                             {t(`payment_mgmt.${tx.type}`) || tx.type}
                          </span>
                        </div>
                      </td>
                      <td className={`py-6 px-8 text-lg font-black text-right ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t(`dashboard.${tx.status}`) || tx.status}</span>
                           </div>
                           {/* Automated Events Simulation */}
                           {tx.type === 'debit' && tx.status === 'completed' && (
                             <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md w-fit">
                                <Unlock size={10} className="text-primary" />
                                <span className="text-[9px] font-bold text-primary uppercase">{t('wallet.table.vault_unlocked')}</span>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                         <div className="flex justify-end gap-2">
                            <button className="p-2 bg-white/5 text-slate-500 hover:text-white rounded-lg transition-colors border border-white/10">
                               <Eye size={16} />
                            </button>
                            {tx.type === 'debit' && tx.status === 'completed' && (
                              <button 
                                 onClick={() => processRefund(tx.id)}
                                 className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                               >
                                 {t('wallet.table.refund')}
                              </button>
                            )}
                         </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              key="events"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8 space-y-8"
            >
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">{t('wallet.events.title')}</h3>
                     <p className="text-xs text-slate-500">{t('wallet.events.subtitle')}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {systemEvents.length > 0 ? systemEvents.map((event) => (
                    <div key={event.id} className="relative pl-8 pb-8 last:pb-0 border-l border-white/5">
                        <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                 {event.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                           </div>
                           <p className="text-sm font-medium text-slate-300 leading-relaxed mb-3">
                              {event.description}
                           </p>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                                 <Plus size={12} /> {t('wallet.events.entity')}: <span className="text-white">{event.userName}</span>
                              </div>
                              {event.referenceId && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                                   <FileText size={12} /> {t('wallet.events.ref')}: <span className="text-white">{event.referenceId}</span>
                                </div>
                              )}
                           </div>
                        </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                       No system events logged
                    </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Simulation */}
      <div className="flex items-center justify-between px-2">
         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {t('wallet.stats.showing').replace('{count}', (activeTab === 'history' ? filteredTransactions.length : filteredWallets.length).toString())}
         </p>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all cursor-not-allowed">{t('wallet.stats.previous')}</button>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">{t('wallet.stats.next')}</button>
         </div>
      </div>
    </div>
  );
}
