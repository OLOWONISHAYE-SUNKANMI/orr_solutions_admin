"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import { useApprovalStore, ApprovalRequest } from "@/store/approvalStore";
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  FileText, 
  UserPlus, 
  RefreshCw,
  Search,
  Trash2,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApprovalQueuePage() {
  const { user } = useAuthStore();
  const { requests, approveRequest, rejectRequest, clearHistory } = useApprovalStore();
  
  // Permission Guard
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_approve_sensitive_actions;

  // Search & Filter State
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Approval Key Dialog State
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [securityKey, setSecurityKey] = useState("");
  const [securityKeyError, setSecurityKeyError] = useState("");

  if (!hasPermission) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-950/20">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/20 backdrop-blur-xl p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">403: Forbidden</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              You do not possess the required digital authorization credentials (<span className="text-red-400 font-mono text-xs">can_approve_sensitive_actions</span>) to access the Super Admin Operations Queue.
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 active:scale-95"
            >
              Return to Safety
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === "ALL" || req.status === filter;
    const matchesSearch = 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.details.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.details.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApproveClick = (id: string) => {
    setApprovingId(id);
    setSecurityKey("");
    setSecurityKeyError("");
  };

  const handleConfirmApprove = async () => {
    if (securityKey.trim().toLowerCase() !== "approve") {
      setSecurityKeyError("Please type 'APPROVE' to authorize this high-security action.");
      return;
    }

    if (approvingId && user) {
      await approveRequest(approvingId, user.full_name || user.username);
      setApprovingId(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;

    if (rejectingId && user) {
      await rejectRequest(rejectingId, user.full_name || user.username, rejectionReason);
      setRejectingId(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "HARD_DELETE": return <Trash2 className="text-red-400" size={18} />;
      case "ROLE_CHANGE": return <UserPlus className="text-amber-400" size={18} />;
      case "MASS_REASSIGN": return <RefreshCw className="text-cyan-400" size={18} />;
      default: return <FileText className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh]">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Super Admin Console
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Security Approval Queue</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Simulated dual-approval gatekeeper. Review administrative deletions, high-security elevations, and data migrations initiated by administrators.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={clearHistory}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition text-xs font-bold font-sans cursor-pointer"
          >
            Clear Finished History
          </button>
        </div>
      </div>

      {/* Main Grid: Filters + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filter Pills */}
        <div className="flex bg-slate-900/60 p-1 border border-white/5 rounded-2xl w-full md:w-auto">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filter === tab 
                  ? "bg-primary text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "PENDING" && `Pending (${requests.filter(r => r.status === "PENDING").length})`}
              {tab === "APPROVED" && "Approved"}
              {tab === "REJECTED" && "Rejected"}
              {tab === "ALL" && "All Logs"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search request logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-primary/40 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Requests Grid List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl">
            <Clock size={48} className="mx-auto text-slate-600 mb-4 stroke-1 animate-pulse" />
            <h3 className="font-bold text-lg text-slate-300">No requests found</h3>
            <p className="text-slate-500 text-xs mt-1">There are no operational authorization queries fitting the filters.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isExpanded = expandedId === req.id;
            return (
              <div 
                key={req.id}
                className={`bg-slate-900/20 border border-white/5 hover:border-white/10 transition-all rounded-3xl overflow-hidden backdrop-blur-sm ${
                  req.status === "PENDING" ? "shadow-[0_4px_20px_rgba(0,0,0,0.25)] border-white/10" : ""
                }`}
              >
                {/* Main Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl ${
                      req.status === "PENDING" ? "bg-slate-800 border border-white/5" : 
                      req.status === "APPROVED" ? "bg-emerald-500/10 border border-emerald-500/20" : 
                      "bg-red-500/10 border border-red-500/20"
                    }`}>
                      {getActionIcon(req.actionType)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-400">{req.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider ${
                          req.actionType === "HARD_DELETE" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          req.actionType === "ROLE_CHANGE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                          {req.actionType.replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">
                        {req.details.targetName}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium">
                        Initiated by <span className="text-slate-200">{req.requestedBy.name}</span> ({req.requestedBy.role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t border-white/5 lg:border-none pt-4 lg:pt-0">
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 lg:justify-end">
                        {req.status === "PENDING" && (
                          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            <Clock size={12} className="animate-spin-slow" />
                            Pending approval
                          </span>
                        )}
                        {req.status === "APPROVED" && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle size={12} />
                            Authorized
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                            <XCircle size={12} />
                            Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-slate-900/10 space-y-6 animate-in slide-in-from-top-1 duration-300">
                    
                    {/* Action Description */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Operation Description</span>
                      <p className="text-slate-300 text-xs bg-slate-900/60 p-4 border border-white/5 rounded-2xl leading-relaxed">
                        {req.details.description}
                      </p>
                    </div>

                    {/* Metadata Detail Items */}
                    {req.details.meta && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/20 p-4 border border-white/5 rounded-2xl">
                        {Object.entries(req.details.meta).map(([key, val]) => (
                          <div key={key} className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className="text-xs font-extrabold block text-slate-300 truncate">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Actions / History Status */}
                    {req.status === "PENDING" ? (
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleRejectClick(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
                        >
                          <X size={14} />
                          Reject Request
                        </button>
                        <button
                          onClick={() => handleApproveClick(req.id)}
                          className="flex items-center gap-1.5 px-5 py-2 border border-emerald-500/20 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
                        >
                          <Check size={14} />
                          Authorize Action
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row justify-between text-xs text-slate-500 gap-2">
                        <div>
                          Reviewed by: <span className="font-bold text-slate-300">{req.reviewedBy}</span>
                        </div>
                        {req.reviewedAt && (
                          <div>
                            Reviewed at: <span className="font-mono">{new Date(req.reviewedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {req.status === "REJECTED" && req.rejectionReason && (
                          <div className="w-full md:w-auto text-red-400 bg-red-500/5 border border-red-500/10 px-3 py-1.5 rounded-lg text-[11px] leading-relaxed mt-1">
                            <strong>Reason:</strong> {req.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Security Authorization Key Modal */}
      {approvingId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900/80 border border-emerald-500/30 backdrop-blur-2xl p-8 rounded-[2rem] text-center space-y-6 shadow-2xl relative">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Verify Authorization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm processing dual-approval <span className="text-white font-bold font-mono">{approvingId}</span>. Type <strong className="text-emerald-400">APPROVE</strong> in the security console input below.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <input
                type="text"
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="Type APPROVE to confirm"
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 focus:border-emerald-500/50 rounded-xl text-center text-sm font-bold tracking-widest text-white uppercase focus:outline-none transition-colors"
              />
              {securityKeyError && (
                <span className="text-[10px] font-bold text-red-400 text-center block">{securityKeyError}</span>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setApprovingId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmApprove}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl transition text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Sign & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900/80 border border-red-500/30 backdrop-blur-2xl p-8 rounded-[2rem] text-center space-y-6 shadow-2xl relative">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <XCircle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Reject Request</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide a detailed compliance reason explaining why request <span className="font-mono text-slate-200">{rejectingId}</span> is rejected.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason or notes..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 focus:border-red-500/50 rounded-xl text-xs font-semibold text-white focus:outline-none transition-colors leading-relaxed"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl transition text-xs shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Log Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
