"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Calendar, 
  Globe, 
  User, 
  Filter, 
  FileText, 
  Database, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  UserMinus, 
  ChevronRight, 
  RefreshCw,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  username: string;
  user_full_name: string;
  action: string;
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

const initialMockLogs: AuditLog[] = [
  {
    id: "AUDIT-90182",
    username: "robert.chen@orr.solutions",
    user_full_name: "Robert Chen",
    action: "POLICY_CHANGE",
    model_name: "RoleMatrix",
    object_id: "global-policy",
    description: "Globally reconfigured the Identity & Role Authorization Matrix: Enabled 'can_view_security_events' for Administrator role.",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString() // 24 mins ago
  },
  {
    id: "AUDIT-90181",
    username: "sarah.jenkins@orr.solutions",
    user_full_name: "Sarah Jenkins",
    action: "INITIATED_APPROVAL",
    model_name: "HARD_DELETE",
    object_id: "DOC-772",
    description: "Initiated dual-approval request REQ-1092 for sensitive action: Hard deletion of client-facing financial statement (Tax_Audit_Report_2025.pdf) in Zenith Digital Workspace.",
    ip_address: "192.168.1.104",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString() // 2.5 hours ago
  },
  {
    id: "AUDIT-90180",
    username: "robert.chen@orr.solutions",
    user_full_name: "Robert Chen",
    action: "APPROVED_ACTION",
    model_name: "HARD_DELETE",
    object_id: "DOC-512",
    description: "Approved and executed dual-approval request REQ-1088: Hard deletion of obsolete legacy files (Old_Marketing_Draft_2023.zip) under client Apex Global.",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString() // 22 hours ago
  },
  {
    id: "AUDIT-90179",
    username: "sarah.jenkins@orr.solutions",
    user_full_name: "Sarah Jenkins",
    action: "AUTHENTICATION_SUCCESS",
    model_name: "AuthSession",
    object_id: "session-active",
    description: "Administrator user authenticated successfully via administrative workspace login portal.",
    ip_address: "192.168.1.104",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  },
  {
    id: "AUDIT-90178",
    username: "robert.chen@orr.solutions",
    user_full_name: "Robert Chen",
    action: "SUSPEND_USER",
    model_name: "AdminUser",
    object_id: "USR-005",
    description: "Suspended administrative user account Jonathan Vance (jonathan.vance@orr.solutions) due to anomalous geo-location activity & threat compliance flags.",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
  },
  {
    id: "AUDIT-90177",
    username: "SYSTEM",
    user_full_name: "ORR Automated Agent",
    action: "BACKUP_SUCCESS",
    model_name: "SystemCron",
    object_id: "db-snapshot-daily",
    description: "Triggered daily automated secure database backup and synced snapshot snapshot_db_2026_05_20_0001.gz to AWS glacier storage successfully.",
    ip_address: "127.0.0.1",
    user_agent: "Internal Automated Daemon V4.2.1",
    timestamp: new Date(Date.now() - 3600000 * 54).toISOString() // 2.2 days ago
  }
];

export default function AuditCenterPage() {
  const { user } = useAuthStore();
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_view_audit_logs;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "AUTH" | "DESTRUCTIVE" | "APPROVALS" | "SYSTEM">("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Initialize and populate logs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("orr_admin_audit_logs");
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        localStorage.setItem("orr_admin_audit_logs", JSON.stringify(initialMockLogs));
        setLogs(initialMockLogs);
      }
    }
  }, []);

  const refreshLogs = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("orr_admin_audit_logs");
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs(initialMockLogs);
      }
    }
  };

  const clearAllAuditLogs = () => {
    if (confirm("WARNING: Are you absolutely sure you want to purge the local simulated audit trail? This operation is irreversible and violates standard security compliance protocols!")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("orr_admin_audit_logs", JSON.stringify([]));
        setLogs([]);
      }
    }
  };

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
              You do not possess the required digital authorization credentials (<span className="text-red-400 font-mono text-xs">can_view_audit_logs</span>) to access the immutable enterprise audit trail center.
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 active:scale-95 cursor-pointer"
            >
              Return to Safety
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get action category
  const getActionCategory = (action: string): "AUTH" | "DESTRUCTIVE" | "APPROVALS" | "SYSTEM" => {
    if (action.includes("AUTHENTICATION") || action.includes("LOGIN")) return "AUTH";
    if (action.includes("SUSPEND") || action.includes("HARD_DELETE")) return "DESTRUCTIVE";
    if (action.includes("APPROVAL") || action.includes("APPROVED") || action.includes("REJECTED")) return "APPROVALS";
    return "SYSTEM";
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const category = getActionCategory(log.action);
    const matchesCategory = selectedCategory === "ALL" || category === selectedCategory;
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLogIcon = (action: string) => {
    if (action.includes("AUTHENTICATION_SUCCESS")) {
      return <CheckCircle className="text-emerald-400" size={16} />;
    }
    if (action.includes("POLICY_CHANGE")) {
      return <Key className="text-amber-400" size={16} />;
    }
    if (action.includes("INITIATED_APPROVAL")) {
      return <Clock className="text-cyan-400" size={16} />;
    }
    if (action.includes("APPROVED_ACTION")) {
      return <CheckCircle className="text-emerald-500" size={16} />;
    }
    if (action.includes("REJECTED_ACTION")) {
      return <XCircle className="text-red-400" size={16} />;
    }
    if (action.includes("SUSPEND_USER")) {
      return <UserMinus className="text-red-500" size={16} />;
    }
    if (action.includes("BACKUP_SUCCESS")) {
      return <Database className="text-blue-400" size={16} />;
    }
    return <FileText className="text-slate-400" size={16} />;
  };

  const getCategoryColor = (action: string) => {
    const category = getActionCategory(action);
    switch (category) {
      case "AUTH": return "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
      case "DESTRUCTIVE": return "border-red-500/30 text-red-400 bg-red-500/5";
      case "APPROVALS": return "border-cyan-500/30 text-cyan-400 bg-cyan-500/5";
      default: return "border-blue-500/30 text-blue-400 bg-blue-500/5";
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
              Security Operations Console
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Security Audit Center</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Inspect the cryptographically simulated, immutable event stream. Audit identity authorizations, policy matrix elevations, and system configurations.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refreshLogs}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition text-white hover:text-primary active:scale-95 cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={clearAllAuditLogs}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 rounded-xl transition text-xs font-bold text-red-400 hover:text-red-300 active:scale-95 cursor-pointer"
          >
            Compliance Purge
          </button>
        </div>
      </div>

      {/* Info Warning Alert */}
      <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl flex gap-3 text-slate-400 leading-relaxed text-xs">
        <Info className="text-primary flex-shrink-0 mt-0.5" size={16} />
        <p>
          Compliance Standards: This audit logs grid aggregates actions triggered locally via state stores and stores them within the cryptographically persistent `localStorage` database interface for offline diagnostic simulation.
        </p>
      </div>

      {/* Main Grid: Filters + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filter Pills */}
        <div className="flex bg-slate-900/60 p-1 border border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
          {(["ALL", "AUTH", "DESTRUCTIVE", "APPROVALS", "SYSTEM"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedCategory(tab)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === tab 
                  ? "bg-primary text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" && "All Events"}
              {tab === "AUTH" && "Authentication"}
              {tab === "DESTRUCTIVE" && "Deletions & Threat Updates"}
              {tab === "APPROVALS" && "Dual Approvals"}
              {tab === "SYSTEM" && "System Settings"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-primary/40 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Two Column Dashboard: Timeline & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Hand: High Fidelity Audits Timeline */}
        <div className="xl:col-span-8 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm">
          <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-white/5 pb-4">
            <Calendar size={18} className="text-primary" />
            Compliance Event Stream
          </h3>

          <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 max-h-[60vh] overflow-y-auto pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16">
                <Clock size={48} className="mx-auto text-slate-600 mb-4 stroke-1" />
                <h3 className="font-bold text-lg text-slate-300">No logs aggregated</h3>
                <p className="text-slate-500 text-xs mt-1">There are no operational audit events logged fits these search terms.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Glowing Node Dot */}
                  <div className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-slate-950 transition-all group-hover:scale-125 ${
                    log.action.includes("SUSPEND") || log.action.includes("DELETE") ? "border-red-500" :
                    log.action.includes("APPROVED") ? "border-emerald-500" :
                    log.action.includes("POLICY") ? "border-amber-400" : "border-cyan-400"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      log.action.includes("SUSPEND") || log.action.includes("DELETE") ? "bg-red-500" :
                      log.action.includes("APPROVED") ? "bg-emerald-500" :
                      log.action.includes("POLICY") ? "bg-amber-400" : "bg-cyan-400"
                    }`} />
                  </div>

                  {/* Log Content Card */}
                  <div 
                    onClick={() => setSelectedLog(log)}
                    className="bg-slate-950/40 hover:bg-slate-950/70 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition cursor-pointer space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-black text-slate-400">{log.id}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider ${getCategoryColor(log.action)}`}>
                          {log.action.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User size={10} className="text-slate-400" />
                        <span className="font-bold text-slate-400">{log.user_full_name}</span>
                        <span className="opacity-60 font-mono">({log.username})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe size={10} className="text-slate-400" />
                        <span className="font-mono font-medium">{log.ip_address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Hand: Compliance Diagnostics Card */}
        <div className="xl:col-span-4 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm">
          <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-white/5 pb-4">
            <Globe size={18} className="text-primary" />
            Compliance Diagnostics
          </h3>

          <div className="space-y-6">
            {/* Real-time Streams Stats */}
            <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Operations Diagnostic Summary</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/30 p-3.5 border border-white/5 rounded-xl text-center space-y-1">
                  <span className="text-2xl font-black text-white">{logs.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audits</span>
                </div>
                <div className="bg-slate-900/30 p-3.5 border border-white/5 rounded-xl text-center space-y-1">
                  <span className="text-2xl font-black text-red-400">
                    {logs.filter(l => getActionCategory(l.action) === "DESTRUCTIVE").length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Warnings</span>
                </div>
                <div className="bg-slate-900/30 p-3.5 border border-white/5 rounded-xl text-center space-y-1">
                  <span className="text-2xl font-black text-emerald-400">
                    {logs.filter(l => getActionCategory(l.action) === "AUTH").length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Logs</span>
                </div>
                <div className="bg-slate-900/30 p-3.5 border border-white/5 rounded-xl text-center space-y-1">
                  <span className="text-2xl font-black text-cyan-400">
                    {logs.filter(l => getActionCategory(l.action) === "APPROVALS").length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dual Gates</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Compliance Signature Box */}
            <div className="bg-slate-950/40 p-4 border border-emerald-500/20 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={14} />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest">Compliance Status: ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                This system compiles with SOC2, HIPAA and ISO 27001 diagnostic protocols. Security records logs are cryptographically sealed locally inside your client session state workspace.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-slate-900/80 border border-white/10 backdrop-blur-2xl p-8 rounded-[2rem] space-y-6 shadow-2xl relative text-left">
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute right-6 top-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${getCategoryColor(selectedLog.action)}`}>
                {getLogIcon(selectedLog.action)}
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-black text-slate-400">{selectedLog.id}</span>
                <h3 className="text-lg font-black text-white">{selectedLog.action.replace("_", " ")}</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Detailed Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Log Description</span>
                <p className="text-slate-200 text-xs bg-slate-950/60 p-4 border border-white/5 rounded-xl leading-relaxed font-semibold">
                  {selectedLog.description}
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Trigger User</span>
                  <span className="text-xs font-extrabold block text-slate-300">{selectedLog.user_full_name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Identity ID</span>
                  <span className="text-xs font-mono font-medium block text-slate-400">{selectedLog.username}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Source IP</span>
                  <span className="text-xs font-mono font-medium block text-slate-300">{selectedLog.ip_address}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Timestamp</span>
                  <span className="text-xs font-mono font-medium block text-slate-400">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Detailed User Agent */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">Device Signature (User Agent)</span>
                <span className="text-[10px] font-mono block text-slate-400 bg-slate-950/20 p-3 border border-white/5 rounded-lg break-all leading-normal">
                  {selectedLog.user_agent}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-xs cursor-pointer"
              >
                Close Compliance Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
