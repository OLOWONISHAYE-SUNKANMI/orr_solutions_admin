"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminClientRequestStore, ClientRequestStatus } from "@/store/adminClientRequestStore";
import { useClientStore } from "@/store/clientStore";
import { Clock, Search, ShieldCheck, ChevronRight, FileText, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ClientRequestsPage() {
  const { requests, fetchRequests, isLoading, createInternalRequest } = useAdminClientRequestStore();
  const { clients, fetchClients } = useClientStore();
  
  const [filter, setFilter] = useState<"ALL" | ClientRequestStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client: "",
    request_title: "",
    short_description: "",
    urgency: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, [fetchRequests, fetchClients]);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === "ALL" || req.status === filter;
    const searchString = `${req.request_id} ${req.request_title} ${req.client_name}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmitInternalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await createInternalRequest(formData);
    if (success) {
      setShowModal(false);
      setFormData({ client: "", request_title: "", short_description: "", urgency: "normal" });
    }
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'clarification_requested': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'approved_for_pm_assignment': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'approved_for_meeting': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'converted_to_project': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'rejected': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'closed':
      case 'archived': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const filterTabs = [
    { label: "All Requests", value: "ALL" },
    { label: "New (Submitted)", value: "submitted" },
    { label: "Needs Clarification", value: "clarification_requested" },
    { label: "Approved (Ready to Convert)", value: "approved_for_pm_assignment" },
    { label: "Converted to Project", value: "converted_to_project" },
  ] as const;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Client Management
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Client Problem Briefs</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Review raw problem requests submitted by clients. Approve and convert them into PM Projects, or request more information.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors z-10"
        >
          <Plus size={20} />
          Create Internal Request
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap bg-slate-900/60 p-1 border border-white/5 rounded-2xl w-full md:w-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                filter === tab.value 
                  ? "bg-primary text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by ID, Title, Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-primary/40 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl">
            <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4 stroke-1" />
            <h3 className="font-bold text-lg text-slate-300">All caught up!</h3>
            <p className="text-slate-500 text-xs mt-1">No requests currently matching this filter.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <Link href={`/client-requests/${req.id}`} key={req.id} className="block">
              <div className="bg-slate-900/20 border border-white/5 hover:border-white/10 transition-all rounded-3xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group backdrop-blur-sm cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-800 border border-white/5 group-hover:scale-105 transition-transform">
                    <FileText className="text-primary" size={24} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-400">{req.request_id}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border tracking-wider ${getStatusColor(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                      {/* Internal Source Badge */}
                      {(req as any).source === 'internally_sourced' && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black border tracking-wider text-purple-400 bg-purple-500/10 border-purple-500/20">
                          INTERNAL
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors">
                      {req.request_title}
                    </h4>
                    <p className="text-slate-400 text-xs font-medium flex items-center gap-2 flex-wrap">
                      <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{req.client_name}</span>
                      <span>•</span>
                      <span>Category: {req.orr_service_area?.replace(/_/g, ' ') || 'TBD'}</span>
                      <span>•</span>
                      <span className={req.urgency === 'high' ? 'text-rose-400' : 'text-slate-400'}>
                        Urgency: {req.urgency?.toUpperCase() || 'NORMAL'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t border-white/5 lg:border-none pt-4 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      {req.submission_date 
                        ? formatDistanceToNow(new Date(req.submission_date), { addSuffix: true })
                        : formatDistanceToNow(new Date(req.created_at), { addSuffix: true })
                      }
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors text-slate-400">
                    <ChevronRight size={20} />
                  </div>
                </div>

              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Internal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Create Internally Sourced Request</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitInternalRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Client</label>
                <select 
                  required
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white"
                >
                  <option value="">Select a Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Needs market analysis"
                  value={formData.request_title}
                  onChange={e => setFormData({...formData, request_title: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Internal notes on what the client needs..."
                  value={formData.short_description}
                  onChange={e => setFormData({...formData, short_description: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Urgency</label>
                <select 
                  value={formData.urgency}
                  onChange={e => setFormData({...formData, urgency: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
