"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X,
   Upload,
   FileText,
   ShieldCheck,
   Lock,
   Unlock,
   Globe,
   EyeOff,
   AlertCircle,
   Loader2,
   CheckCircle2
} from 'lucide-react';
import { useVaultStore, FileType, Visibility } from '@/store/vaultStore';
import { useClientStore } from '@/store/clientStore';
import { useEffect } from 'react';
import { vaultApi } from '@/lib/vault-api';

interface UploadDocumentModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
   const { uploadDocument, createGoogleDoc, folders, fetchFolders, isLoadingDocuments: isLoading } = useVaultStore();
   const { clients, fetchClients } = useClientStore();
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (isOpen) {
         fetchClients();
         fetchFolders();
      }
   }, [isOpen, fetchClients, fetchFolders]);

   const [step, setStep] = useState<'file' | 'metadata'>('file');
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [clientSearch, setClientSearch] = useState('');

   const filteredClients = clients.filter(c =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(clientSearch.toLowerCase())
   );

   const [formData, setFormData] = useState({
      title: '',
      description: '',
      client: '',
      project: '',
      category: '',
      folderId: '',
      visibility: 'client' as Visibility,
      accessRule: {
         type: 'immediate' as any,
         description: 'Available immediately'
      }
   });

   const [clientFolders, setClientFolders] = useState<any[]>([]);

   useEffect(() => {
      if (formData.client) {
         vaultApi.getFolders({ client_id: formData.client })
            .then(data => setClientFolders(data))
            .catch(err => console.error(err));
      } else {
         setClientFolders([]);
      }
   }, [formData.client]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setSelectedFile(file);
         setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
         setStep('metadata');
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) return;

      // Simulate upload progress
      const interval = setInterval(() => {
         setUploadProgress(prev => {
            if (prev >= 100) {
               clearInterval(interval);
               return 100;
            }
            return prev + 10;
         });
      }, 100);

      const isGoogleDoc = selectedFile.name.includes('Google Doc');
      const isGoogleSheet = selectedFile.name.includes('Google Sheet');
      const isGoogleSlide = selectedFile.name.includes('Google Slide');

      if (isGoogleDoc || isGoogleSheet || isGoogleSlide) {
         const gType = isGoogleDoc ? 'google_doc' : isGoogleSheet ? 'google_sheet' : 'google_slide';
         await createGoogleDoc(formData.title, formData.client, gType, formData.folderId || null);
      } else {
         const type: FileType = selectedFile.name.endsWith('.pdf') ? 'pdf' :
            selectedFile.name.endsWith('.xlsx') ? 'xlsx' : 'other';

         await uploadDocument({
            ...formData,
            type,
         }, selectedFile);
      }

      setTimeout(() => {
         onClose();
         setStep('file');
         setSelectedFile(null);
         setUploadProgress(0);
      }, 1500);
   };

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
               />

               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
               >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                     <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                           Upload <span className="text-primary">Document</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Add a new file to your workspace</p>
                     </div>
                     <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <div className="p-8 max-h-[70vh] overflow-y-auto">
                     {step === 'file' ? (
                        <div className="space-y-8">
                           <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                           >
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                 <Upload size={28} />
                              </div>
                              <div className="text-center space-y-2">
                                 <p className="text-sm font-black uppercase tracking-widest text-white">Drop documents here</p>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">Supports Office, PDF, Media, and Archives. Max 500MB per file.</p>
                              </div>
                              <input
                                 type="file"
                                 ref={fileInputRef}
                                 onChange={handleFileChange}
                                 className="hidden"
                              />
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Or Create Native Asset</p>
                              <div className="grid grid-cols-3 gap-4">
                                 {[
                                    { id: 'doc', label: 'Google Doc', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/30' },
                                    { id: 'sheet', label: 'Google Sheet', icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/30' },
                                    { id: 'slide', label: 'Google Slide', icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/30' }
                                 ].map(item => (
                                    <button
                                       key={item.id}
                                       type="button"
                                       onClick={() => {
                                          setSelectedFile(new File([""], `Untitled ${item.label}`)); // Mock file
                                          setFormData(prev => ({ ...prev, title: `Untitled ${item.label}` }));
                                          setStep('metadata');
                                       }}
                                       className={`flex flex-col items-center gap-3 p-5 border border-white/5 rounded-2xl transition-all group ${item.bg}`}
                                    >
                                       <item.icon size={24} className={`${item.color} group-hover:scale-110 transition-transform`} />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Document Title</label>
                                 <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Client Association</label>
                                 <input
                                    type="text"
                                    placeholder="Search client..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-2 px-5 mb-2 text-xs focus:outline-none focus:border-primary/50 text-white"
                                 />
                                 <select
                                    required
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value, folderId: '' })}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                 >
                                    <option value="" className="bg-slate-900">Select Client</option>
                                    {filteredClients.map(client => (
                                       <option key={client.id} value={client.id} className="bg-slate-900">{client.name} ({client.company})</option>
                                    ))}
                                 </select>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Repository Folder</label>
                                 <select
                                    value={formData.folderId}
                                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                 >
                                    <option value="" className="bg-slate-900">Root Directory</option>
                                    {clientFolders
                                       
                                       .map(folder => (
                                          <option key={folder.id} value={folder.id} className="bg-slate-900">{folder.name}</option>
                                       ))}
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Project Code</label>
                                 <input
                                    type="text"
                                    required
                                    placeholder="e.g. ALPHA-2024"
                                    value={formData.project}
                                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Taxonomy Category</label>
                                 <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white"
                                 >
                                    <option value="" className="bg-slate-900">Select Category</option>
                                    <option value="Finance" className="bg-slate-900">Finance & Strategy</option>
                                    <option value="Legal" className="bg-slate-900">Legal & Compliance</option>
                                    <option value="Operational" className="bg-slate-900">Operational Data</option>
                                    <option value="Creative" className="bg-slate-900">Creative Assets</option>
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Logic & Unlock Conditions</label>
                              <div className="grid grid-cols-2 gap-4">
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, accessRule: { type: 'immediate', description: 'Immediate' } })}
                                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${formData.accessRule.type === 'immediate' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(205,255,0,0.1)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                       }`}
                                 >
                                    <Unlock size={20} />
                                    <div className="text-left">
                                       <p className="text-xs font-black uppercase tracking-widest text-white">Immediate</p>
                                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Always Available</p>
                                    </div>
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, accessRule: { type: 'payment_linked', description: 'Linked to Invoice' } })}
                                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${formData.accessRule.type === 'payment_linked' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(205,255,0,0.1)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                       }`}
                                 >
                                    <Lock size={20} />
                                    <div className="text-left">
                                       <p className="text-xs font-black uppercase tracking-widest text-white">Payment Linked</p>
                                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Locked until paid</p>
                                    </div>
                                 </button>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Exposure Level</label>
                              <div className="flex bg-[#1a1f26] p-1.5 rounded-2xl border border-white/5">
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'client' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.visibility === 'client' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                       }`}
                                 >
                                    <Globe size={16} /> Client Facing
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'internal' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.visibility === 'internal' ? 'bg-yellow-500/20 text-yellow-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                       }`}
                                 >
                                    <EyeOff size={16} /> Internal (ORR Only)
                                 </button>
                              </div>
                              {formData.visibility === 'internal' && (
                                 <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mt-4">
                                    <AlertCircle className="text-yellow-500 flex-shrink-0" size={18} />
                                    <p className="text-xs font-medium text-yellow-500/80 leading-relaxed">
                                       Warning: Internal documents are strictly restricted to ORR Admins. Clients will not see these in their vault.
                                    </p>
                                 </div>
                              )}
                           </div>

                           <div className="pt-8 border-t border-white/10">
                              {uploadProgress > 0 ? (
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                       <div className="flex items-center gap-3">
                                          <Loader2 className="text-primary animate-spin" size={20} />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Uploading...</p>
                                       </div>
                                       <p className="text-sm font-black text-primary">{uploadProgress}%</p>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                       <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${uploadProgress}%` }}
                                          className="h-full bg-primary shadow-[0_0_10px_rgba(205,255,0,0.5)]"
                                       />
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex justify-end gap-4">
                                    <button
                                       type="button"
                                       onClick={() => setStep('file')}
                                       className="py-4 px-8 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all"
                                    >
                                       Change File
                                    </button>
                                    <button
                                       type="submit"
                                       className="py-4 px-8 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-lemon transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(205,255,0,0.2)]"
                                    >
                                       <Upload size={16} />
                                       Upload Document
                                    </button>
                                 </div>
                              )}
                           </div>
                        </form>
                     )}
                  </div>

                  {/* Safety Footer */}
                  <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-6">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Automated Malware Shield Active</p>
                     </div>
                     <div className="w-px h-4 bg-white/10" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">End-to-End Encryption Enabled</p>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
}

