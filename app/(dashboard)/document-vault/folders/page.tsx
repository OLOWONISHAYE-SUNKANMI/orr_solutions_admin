"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  Folder,
  FolderOpen,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  Edit2,
  Users,
  Briefcase
} from 'lucide-react';
import { useVaultStore, Folder as FolderType } from '@/store/vaultStore';
import { useClientStore } from '@/store/clientStore';
import Link from 'next/link';

export default function FolderManagementPage() {
  const { folders, isLoadingFolders, fetchFolders, createFolder, updateFolder, deleteFolder } = useVaultStore();
  const { clients, fetchClients } = useClientStore();

  React.useEffect(() => {
    fetchFolders();
    fetchClients();
  }, [fetchFolders, fetchClients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const getClientName = (clientId: string | number | undefined) => {
    if (!clientId) return '';
    const clientObj = clients.find(c => c.id.toString() === clientId.toString());
    return clientObj ? `${clientObj.name} (${clientObj.company})` : `Client #${clientId}`;
  };

  const filteredFolders = folders.filter(f => {
    const nameMatches = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const clientName = f.client ? getClientName(f.client) : '';
    const clientMatches = clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatches || clientMatches;
  });

  const getDocCount = (folder: any) => {
    return folder.doc_count || 0;
  };

  const handleCreateFolder = () => {
    if (!newFolderName) return;
    createFolder(newFolderName, selectedParentId, selectedClientId || undefined);
    setNewFolderName('');
    setSelectedClientId('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen pb-24 text-white relative">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <FolderOpen size={14} />
              Hierarchy Manager
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Folder <span className="text-primary">Structure</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Define how documents are logically grouped across the system. Organize by client, project, or category.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-lemon transition-all shadow-xl shadow-primary/10"
          >
            <FolderPlus size={18} />
            Create Folder
          </button>
        </div>

        {/* Controls */}
        <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search folders or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingFolders ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-card/20 border border-white/5 rounded-[32px] p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/10" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-white/5 rounded-full w-24" />
                    <div className="h-6 bg-white/5 rounded-full w-20" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="h-3 bg-white/5 rounded w-24" />
                  <div className="h-3 bg-white/10 rounded w-16" />
                </div>
              </div>
            ))
          ) : (
            filteredFolders.map((folder) => (
              <motion.div
                key={folder.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/20 backdrop-blur-xl border border-white/5 hover:border-primary/30 rounded-[32px] p-6 group transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Folder size={28} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors mb-2">{folder.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {folder.client && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                        <Users size={12} className="text-primary" />
                        {getClientName(folder.client)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                      <FolderOpen size={12} className="text-blue-400" />
                      {getDocCount(folder)} Documents
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Created {new Date(folder.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/document-vault/all?folder=${folder.id}`}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-lemon transition-colors"
                  >
                    View Contents <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {filteredFolders.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
              <FolderOpen size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No folders found</h3>
              <p className="text-slate-400 text-sm">Start by creating a new folder structure.</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Create First Folder
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreateModalOpen(false); setSelectedClientId(''); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white uppercase italic mb-6">Create <span className="text-primary">Folder</span></h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Client Association</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-[#161a22] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all cursor-pointer text-sm"
                  >
                    <option value="" className="bg-slate-900">Global / No Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id} className="bg-slate-900">
                        {client.name} ({client.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setIsCreateModalOpen(false); setSelectedClientId(''); }}
                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="flex-1 px-6 py-4 bg-primary hover:bg-lemon text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
