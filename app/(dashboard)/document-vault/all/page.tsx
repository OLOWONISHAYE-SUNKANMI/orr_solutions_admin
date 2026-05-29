"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  MoreVertical,
  History,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Trash2,
  Upload,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  ArrowUpCircle,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Settings2
} from 'lucide-react';

import { useVaultStore, Document, FileType, Visibility, ScanStatus } from '@/store/vaultStore';
import { useLanguageStore } from '@/store/languageStore';
import Link from 'next/link';

import UploadDocumentModal from '@/app/(dashboard)/document-vault/UploadDocumentModal';
import DocumentDetailView from '@/app/(dashboard)/document-vault/DocumentDetailView';

export default function DocumentVaultPage() {
  const { t } = useLanguageStore();
  const { documents, folders, isLoadingDocuments, isLoadingFolders, fetchDocuments, fetchFolders, toggleVisibility, deleteDocument, batchUpdate } = useVaultStore();

  // Fetch folders once (stale-data check happens inside the store)
  React.useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);


  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<Visibility | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ScanStatus | 'all'>('all');
  const [filterFolder, setFilterFolder] = useState<string | 'all'>('all');

  // Handle folder filter from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folderId = params.get('folder');
    if (folderId) {
      setFilterFolder(folderId);
    }
  }, []);

  React.useEffect(() => {
    const params: any = {};
    if (filterFolder !== 'all') params.folder_id = filterFolder;
    fetchDocuments(params, true);
  }, [fetchDocuments, filterFolder]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(documents.map(d => d.category));
    return Array.from(cats);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.client || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVisibility = filterVisibility === 'all' || doc.visibility === filterVisibility;
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.scanStatus === filterStatus;
      const matchesFolder = filterFolder === 'all' || doc.folderId?.toString() === filterFolder.toString();
      return matchesSearch && matchesVisibility && matchesCategory && matchesStatus && matchesFolder;
    });
  }, [documents, searchQuery, filterVisibility, filterCategory, filterStatus, filterFolder]);

  const stats = useMemo(() => {
    return {
      missingCategory: documents.filter(d => !d.category || d.category === '').length,
      noUnlockRule: documents.filter(d => d.visibility === 'client' && d.accessRule?.type === 'immediate').length, // Warning for high value docs maybe?
      scanning: documents.filter(d => d.scanStatus === 'scanning').length,
    };
  }, [documents]);

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf': return <FileText className="text-rose-400" />;
      case 'xlsx': return <FileText className="text-emerald-400" />;
      case 'image': return <FileText className="text-blue-400" />;
      default: return <FileText className="text-slate-400" />;
    }
  };

  const getScanBadge = (status: ScanStatus) => {
    switch (status) {
      case 'passed': return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"><ShieldCheck size={10} /> {t('vault.scans.passed')}</span>;
      case 'failed': return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"><ShieldAlert size={10} /> {t('vault.scans.failed')}</span>;
      case 'scanning': return <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">{t('vault.scans.scanning')}</span>;
      default: return null;
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedDocs(checked ? filteredDocuments.map(d => d.id) : []);
  };

  const toggleSelect = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkArchive = async () => {
    if (confirm(`Are you sure you want to archive ${selectedDocs.length} documents?`)) {
      for (const id of selectedDocs) {
        await deleteDocument(id);
      }
      setSelectedDocs([]);
    }
  };

  return (
    <div className="min-h-screen pb-24 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Settings2 size={14} />
              Central Control Layer
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              All <span className="text-primary italic">Documents</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Master grid for enterprise assets. Manage lifecycle, monitor health, and orchestrate visibility across the workspace.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-lemon transition-all shadow-xl shadow-primary/10"
            >
              <Plus size={18} />
              {t('vault.upload_new')}
            </button>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Health</p>
              <p className="text-xs font-bold text-white uppercase tracking-tight">All Scans Validated</p>
            </div>
          </div>

          {stats.missingCategory > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Action Required</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight">{stats.missingCategory} Missing Category</p>
              </div>
            </div>
          )}

          {stats.noUnlockRule > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Unlock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Audit Suggestion</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight">{stats.noUnlockRule} Immediate Assets</p>
              </div>
            </div>
          )}
        </div>

        {/* Creation Hub */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'doc', label: 'New Google Doc', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
            { id: 'sheet', label: 'New Google Sheet', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/10' },
            { id: 'slide', label: 'New Google Slide', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/10' },
            { id: 'upload', label: 'Upload Local File', icon: Upload, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' }
          ].map(item => (
            <motion.button
              key={item.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'upload') {
                  setIsUploadModalOpen(true);
                } else {
                  window.location.href = `/document-vault/studio?create=${item.id}`;
                }
              }}
              className={`${item.bg} ${item.border} border p-6 rounded-[32px] flex flex-col items-center gap-4 group transition-all hover:bg-white/5 shadow-xl shadow-black/20`}
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Create</p>
                <p className="text-sm font-black text-white uppercase italic tracking-tight">{item.label}</p>
              </div>
            </motion.button>
          ))}
        </section>

        {/* Main Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-card/30 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder={t('vault.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none"
              >
                <option value="all">All Folders</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none"
              >
                <option value="all">All Visibility</option>
                <option value="client">Client-Facing</option>
                <option value="internal">Internal Only</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="scanning">Scanning</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {selectedDocs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/20 border border-primary/40 rounded-3xl p-4 flex items-center gap-6"
            >
              <p className="text-[10px] font-black text-primary uppercase whitespace-nowrap">{selectedDocs.length} Selected</p>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkArchive}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lemon transition-all"
                >
                  Archive All
                </button>
                <button className="px-4 py-2 bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  Bulk Tag
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Data Grid */}
        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-6 px-8 w-10">
                    <input
                      type="checkbox"
                      checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document / Health</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Structure</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Indicators</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingDocuments ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-white/5 bg-white/[0.01]">
                      <td className="py-6 px-8">
                        <div className="w-4 h-4 bg-white/10 rounded" />
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                          <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-48" />
                            <div className="h-3 bg-white/5 rounded w-24" />
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
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-4 bg-white/10 rounded w-16" />
                          <div className="h-3 bg-white/5 rounded w-12" />
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="h-8 w-8 bg-white/10 rounded-2xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <AnimatePresence mode='popLayout'>
                    {filteredDocuments.map((doc, idx) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-6 px-8">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => toggleSelect(doc.id)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                              {getFileIcon(doc.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{doc.title}</p>
                                {!doc.category && (
                                  <span title="Missing Category">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">v{doc.currentVersion || 1} • {(doc.versions || []).length} Total</p>
                                {doc.visibility === 'internal' && <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-[0.2em]">Restricted</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-8">
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{doc.client}</p>
                          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">{doc.project}</p>
                        </td>

                        <td className="py-6 px-8">
                          <div className="flex flex-col items-center gap-2">
                            {getScanBadge(doc.scanStatus)}
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                              {doc.accessRule?.type === 'immediate' ? (
                                <span className="text-emerald-500/60">Immediate</span>
                              ) : (
                                <span className="text-amber-500/60 flex items-center gap-1"><Lock size={8} /> {doc.accessRule?.linkedId || doc.accessRule?.type || 'Locked'}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-8 text-right">
                          <Link
                            href={`/document-vault/${doc.id}`}
                            className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all inline-block"
                          >
                            <ChevronRight size={18} />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredDocuments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-6"
                          >
                            <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-slate-700">
                              <FileText size={48} />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-black text-white uppercase italic">Vault Empty</h3>
                              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">No documents matching your current filters. Start by uploading a new repository asset.</p>
                            </div>
                            <button
                              onClick={() => setIsUploadModalOpen(true)}
                              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                            >
                              Initialize Upload
                            </button>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      {selectedDoc && <DocumentDetailView doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </div>
  );
}
