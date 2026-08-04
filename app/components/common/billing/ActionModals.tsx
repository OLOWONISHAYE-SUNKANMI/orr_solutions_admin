"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, FileText, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useWalletStore } from '@/store/walletStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

import { useLanguageStore } from '@/store/languageStore';

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function ActionModals() {
  const { t } = useLanguageStore();
  const { createInvoice } = useInvoiceStore();
  const { adjustBalance, wallets, balanceModalOpen, selectedUserId, openBalanceModal, closeBalanceModal } = useWalletStore();

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    dueDate: '',
    items: [{ id: '1', description: '', quantity: 1, price: 0, total: 0 }],
    notes: ''
  });

  // Balance Form State
  const [balanceForm, setBalanceForm] = useState({
    userId: '',
    amount: 0,
    type: 'credit' as 'credit' | 'debit',
    description: ''
  });

  // Pre-fill the user when the modal is opened from a wallet card
  React.useEffect(() => {
    if (balanceModalOpen && selectedUserId != null) {
      setBalanceForm(prev => ({ ...prev, userId: String(selectedUserId) }));
    }
    if (!balanceModalOpen) {
      setBalanceForm({ userId: '', amount: 0, type: 'credit', description: '' });
    }
  }, [balanceModalOpen, selectedUserId]);

  const handleAddInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { id: Math.random().toString(), description: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const handleInvoiceItemChange = (id: string, field: string, value: any) => {
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedItem.total = updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      })
    });
  };

  const handleCreateInvoice = async () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0.2; // 20% default
    
    await createInvoice({
      ...invoiceForm,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      status: 'issued'
    });
    
    setInvoiceModalOpen(false);
    // Reset form
  };

  const handleAdjustBalance = async () => {
    await adjustBalance(
      balanceForm.userId,
      balanceForm.amount,
      balanceForm.type,
      balanceForm.description
    );
    closeBalanceModal();
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setInvoiceModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(14,194,119,0.3)] hover:shadow-primary/50 transition-all"
      >
        <Plus size={20} />
        {t('wallet.modals.new_invoice')}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openBalanceModal()}
        className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        <Wallet size={20} className="text-primary" />
        {t('wallet.modals.wallet_op')}
      </motion.button>

      {/* Invoice Modal */}
      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title={t('wallet.modals.generate_invoice')}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.client_name')}</label>
              <select 
                value={invoiceForm.clientId}
                onChange={(e) => {
                  const wallet = wallets.find(w => w.userId.toString() === e.target.value);
                  setInvoiceForm({
                    ...invoiceForm, 
                    clientId: e.target.value,
                    clientName: wallet?.userName || '',
                    clientEmail: wallet?.userEmail || ''
                  });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50"
              >
                <option value="">{t('wallet.modals.select_client')}...</option>
                {(Array.isArray(wallets) ? wallets : []).map(w => (
                  <option key={w.userId} value={w.userId}>{w.userName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.due_date')}</label>
              <input 
                type="date" 
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('wallet.modals.line_items')}</h4>
              <button 
                onClick={handleAddInvoiceItem}
                className="text-primary hover:text-lemon transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus size={14} /> {t('wallet.modals.add_item')}
              </button>
            </div>
            
            {invoiceForm.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-6 space-y-1">
                   <input 
                    type="text" 
                    placeholder={t('wallet.modals.description')}
                    value={item.description}
                    onChange={(e) => handleInvoiceItemChange(item.id, 'description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                   />
                </div>
                <div className="col-span-5 md:col-span-2 space-y-1">
                   <input 
                    type="number" 
                    placeholder={t('wallet.modals.qty')}
                    value={item.quantity}
                    onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                   />
                </div>
                <div className="col-span-5 md:col-span-3 space-y-1">
                   <input 
                    type="number" 
                    placeholder={t('wallet.modals.price')}
                    value={item.price}
                    onChange={(e) => handleInvoiceItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                   />
                </div>
                <div className="col-span-2 md:col-span-1 pb-1 flex justify-center">
                   <button 
                    onClick={() => setInvoiceForm({...invoiceForm, items: invoiceForm.items.filter(i => i.id !== item.id)})}
                    className="text-rose-500 hover:text-rose-400 p-1"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={handleCreateInvoice}
              className="w-full bg-primary text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-lemon transition-all"
            >
              {t('wallet.modals.generate_and_issue')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Wallet Modal */}
      <Modal isOpen={balanceModalOpen} onClose={closeBalanceModal} title={t('wallet.modals.adjust_balance')}>
        <div className="space-y-6">
           <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
             <AlertTriangle className="text-amber-500" size={24} />
             <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest leading-relaxed">
               {t('wallet.modals.warning_adjustment')}
             </p>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.select_client')}</label>
                <select 
                  value={balanceForm.userId}
                  onChange={(e) => setBalanceForm({...balanceForm, userId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50"
                >
                  <option value="">{t('wallet.modals.select_client')}...</option>
                  {(Array.isArray(wallets) ? wallets : []).map(w => (
                    <option key={w.userId} value={w.userId}>{w.userName} (${w.balance})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.adjustment_type')}</label>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setBalanceForm({...balanceForm, type: 'credit'})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${balanceForm.type === 'credit' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                    >
                      {t('wallet.modals.credit')}
                    </button>
                    <button 
                      onClick={() => setBalanceForm({...balanceForm, type: 'debit'})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${balanceForm.type === 'debit' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
                    >
                      {t('wallet.modals.debit')}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.amount_usd')}</label>
                  <input 
                    type="number" 
                    value={balanceForm.amount}
                    onChange={(e) => setBalanceForm({...balanceForm, amount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallet.modals.reason')}</label>
                <textarea 
                  value={balanceForm.description}
                  onChange={(e) => setBalanceForm({...balanceForm, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50 min-h-[100px]"
                  placeholder={t('wallet.modals.reason')}
                />
              </div>

              <button 
                onClick={handleAdjustBalance}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                 {t('wallet.modals.authorize')}
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
