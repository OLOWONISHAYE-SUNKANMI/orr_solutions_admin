"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Download, FileText, Wallet, LayoutGrid, List } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import FinancialStatsOverview from '@/app/components/common/billing/FinancialStatsOverview';
import InvoiceManager from '@/app/components/common/billing/InvoiceManager';
import WalletManager from '@/app/components/common/billing/WalletManager';
import ConsultantInvoiceManager from '@/app/components/common/billing/ConsultantInvoiceManager';
import ActionModals from '@/app/components/common/billing/ActionModals';

export default function FinancialManagementPage() {
  const { t } = useLanguageStore();
  const [activeSection, setActiveSection] = useState<'invoices' | 'wallets' | 'consultants'>('invoices');

  return (
    <div className="min-h-screen pb-24 text-white relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} />
              Secure Financial Oversight
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Financial <span className="text-primary italic">Management</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              A comprehensive command center for invoice orchestration, wallet synchronization, and audit-ready financial reporting.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
             <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-xl text-xs font-bold shadow-lg">
               <Download size={14} /> Export Report
             </button>
             <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 transition-all">
               <Calendar size={14} /> Fiscal Year 2026
             </button>
          </div>
        </div>

        {/* Stats Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid size={16} /> Dashboard Snapshot
            </h2>
          </div>
          <FinancialStatsOverview />
        </section>

        {/* Management Area */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between border-b border-white/5 pb-4 gap-4">
             <div className="flex gap-8">
                <button 
                  onClick={() => setActiveSection('invoices')}
                  className={`relative pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                    activeSection === 'invoices' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={18} /> Invoicing System
                  </span>
                  {activeSection === 'invoices' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('wallets')}
                  className={`relative pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                    activeSection === 'wallets' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wallet size={18} /> Wallet Operations
                  </span>
                  {activeSection === 'wallets' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('consultants')}
                  className={`relative pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                    activeSection === 'consultants' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <List size={18} /> Consultant Disbursements
                  </span>
                  {activeSection === 'consultants' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
             </div>
             
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-emerald-500" />
                Audit Logs Synchronized
             </div>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeSection === 'invoices' && <InvoiceManager />}
            {activeSection === 'wallets' && <WalletManager />}
            {activeSection === 'consultants' && <ConsultantInvoiceManager />}
          </motion.div>
        </section>

        {/* Global Action Floating Modals */}
        <ActionModals />
      </div>
    </div>
  );
}
