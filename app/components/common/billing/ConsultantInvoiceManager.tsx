"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export default function ConsultantInvoiceManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/consultants/invoices/`);
      const data = await res.json();
      setInvoices(data.data || data.results || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to fetch consultant invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleApprove = async (invoiceId: string) => {
    try {
      await fetch(`${API_URL}/api/v1/consultants/invoices/${invoiceId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'PAID' })
      });
      fetchInvoices();
    } catch (err) {
      console.error('Failed to approve invoice:', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'UNDER_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SUBMITTED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = 
      (inv.task_title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (inv.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.consultant || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Consultant, or Task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="text-slate-500 hidden md:block" size={18} />
          {['all', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-300 border ${
                filterStatus === status 
                  ? 'bg-primary text-slate-900 border-primary shadow-[0_0_15px_rgba(14,194,119,0.4)]' 
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Consultant</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {filteredInvoices.map((invoice, idx) => (
                    <motion.tr 
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                            <FileText size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{invoice.invoice_number}</div>
                            <div className="text-xs text-slate-500">{invoice.task_title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">{invoice.consultant}</div>
                        <div className="text-xs text-slate-500">{new Date(invoice.submitted_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-white">${parseFloat(invoice.amount).toFixed(2)}</div>
                        <div className="text-xs text-slate-500">{invoice.hours} hrs @ ${parseFloat(invoice.rate).toFixed(2)}/hr</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusStyle(invoice.status)}`}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status !== 'PAID' && (
                            <button 
                              onClick={() => handleApprove(invoice.id)}
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                              title="Approve & Pay"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
