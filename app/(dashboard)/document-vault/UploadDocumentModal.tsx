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
   const { uploadDocument, createGoogleDoc, folders, fetchFolders, isLoading } = useVaultStore();
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
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
               >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                     <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                           Upload <span className="text-primary">Repository</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Infrastructure Layer 04</p>
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
                              className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center gap-6 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                           >
                              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                 <Upload size={32} />
                              </div>
                              <div className="text-center space-y-2">
                                 <p className="text-lg font-black text-white uppercase tracking-tight">Drop documents here</p>
                                 <p className="text-sm text-slate-500 font-medium max-w-xs">Supports Office, PDF, Media, and Archives. Max 500MB per file.</p>
                              </div>
                              <input
                                 type="file"
                                 ref={fileInputRef}
                                 onChange={handleFileChange}
                                 className="hidden"
                              />
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center italic">Or Create Native Asset</p>
                              <div className="grid grid-cols-3 gap-4">
                                 {[
                                    { id: 'doc', label: 'Google Doc', icon: FileText, color: 'text-blue-400' },
                                    { id: 'sheet', label: 'Google Sheet', icon: FileText, color: 'text-emerald-400' },
                                    { id: 'slide', label: 'Google Slide', icon: FileText, color: 'text-amber-400' }
                                 ].map(item => (
                                    <button
                                       key={item.id}
                                       type="button"
                                       onClick={() => {
                                          setSelectedFile(new File([""], `Untitled ${item.label}`)); // Mock file
                                          setFormData(prev => ({ ...prev, title: `Untitled ${item.label}` }));
                                          setStep('metadata');
                                       }}
                                       className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/30 hover:bg-white/10 transition-all group"
                                    >
                                       <item.icon size={24} className={`${item.color} group-hover:scale-110 transition-transform`} />
                                       <span className="text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Document Title</label>
                                 <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Association</label>
                                 <select
                                    required
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value, folderId: '' })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                 >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                       <option key={client.id} value={client.id}>{client.name} ({client.company})</option>
                                    ))}
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Repository Folder</label>
                                 <select
                                    value={formData.folderId}
                                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                 >
                                    <option value="">Root Directory</option>
                                    {clientFolders
                                       
                                       .map(folder => (
                                          <option key={folder.id} value={folder.id}>{folder.name}</option>
                                       ))}
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Code</label>
                                 <input
                                    type="text"
                                    required
                                    placeholder="e.g. ALPHA-2024"
                                    value={formData.project}
                                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Taxonomy Category</label>
                                 <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                 >
                                    <option value="">Select Category</option>
                                    <option value="Finance">Finance & Strategy</option>
                                    <option value="Legal">Legal & Compliance</option>
                                    <option value="Operational">Operational Data</option>
                                    <option value="Creative">Creative Assets</option>
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Logic & Unlock Conditions</label>
                              <div className="grid grid-cols-2 gap-4">
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, accessRule: { type: 'immediate', description: 'Immediate' } })}
                                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.accessRule.type === 'immediate' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400'
                                       }`}
                                 >
                                    <Unlock size={18} />
                                    <div className="text-left">
                                       <p className="text-xs font-black uppercase">Immediate</p>
                                       <p className="text-[9px] opacity-60 font-bold italic">Always Available</p>
                                    </div>
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, accessRule: { type: 'payment_linked', description: 'Linked to Invoice' } })}
                                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.accessRule.type === 'payment_linked' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400'
                                       }`}
                                 >
                                    <Lock size={18} />
                                    <div className="text-left">
                                       <p className="text-xs font-black uppercase">Payment Linked</p>
                                       <p className="text-[9px] opacity-60 font-bold italic">Locked until paid</p>
                                    </div>
                                 </button>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exposure Level</label>
                              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'client' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${formData.visibility === 'client' ? 'bg-primary text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                                       }`}
                                 >
                                    <Globe size={14} /> Client Facing
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: 'internal' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${formData.visibility === 'internal' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                                       }`}
                                 >
                                    <EyeOff size={14} /> Internal (ORR Only)
                                 </button>
                              </div>
                              {formData.visibility === 'internal' && (
                                 <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
                                    <AlertCircle className="text-amber-500 flex-shrink-0" size={16} />
                                    <p className="text-[10px] text-amber-500/80 font-bold leading-relaxed italic">
                                       Warning: Internal documents are strictly restricted to ORR Admins. Clients will not see these in their vault.
                                    </p>
                                 </div>
                              )}
                           </div>

                           <div className="pt-6 border-t border-white/5">
                              {uploadProgress > 0 ? (
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                       <div className="flex items-center gap-3">
                                          <Loader2 className="text-primary animate-spin" size={20} />
                                          <p className="text-sm font-black text-white uppercase tracking-widest">Uploading Infrastructure...</p>
                                       </div>
                                       <p className="text-xs font-black text-primary">{uploadProgress}%</p>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                       <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${uploadProgress}%` }}
                                          className="h-full bg-primary"
                                       />
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex gap-4">
                                    <button
                                       type="button"
                                       onClick={() => setStep('file')}
                                       className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all"
                                    >
                                       Change File
                                    </button>
                                    <button
                                       type="submit"
                                       className="flex-[2] py-4 px-6 bg-primary text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-lemon transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                       <ShieldCheck size={18} />
                                       Initialize & Scan
                                    </button>
                                 </div>
                              )}
                           </div>
                        </form>
                     )}
                  </div>

                  {/* Safety Footer */}
                  <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center justify-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Automated Malware Shield Active</p>
                     </div>
                     <div className="w-px h-3 bg-white/10" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End-to-End Encryption Enabled</p>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
}

