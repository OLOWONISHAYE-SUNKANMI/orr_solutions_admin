"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import { 
  ROLE_PERMISSIONS, 
  Permission, 
  RoleName 
} from "@/lib/rbac/permissions";
import { 
  ShieldAlert, 
  Search, 
  UserX, 
  Check, 
  X,
  Settings, 
  ShieldCheck, 
  ShieldX, 
  Info,
  Lock,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  department: string;
  status: "ACTIVE" | "SUSPENDED";
  lastActive: string;
  ipAddress: string;
}

const initialAdminUsers: AdminUserRecord[] = [
  {
    id: "USR-001",
    name: "Robert Chen",
    email: "robert.chen@orr.solutions",
    role: "super_admin",
    department: "Security & Operations",
    status: "ACTIVE",
    lastActive: "Just now",
    ipAddress: "192.168.1.1"
  },
  {
    id: "USR-002",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@orr.solutions",
    role: "admin",
    department: "Administrative Support",
    status: "ACTIVE",
    lastActive: "15 mins ago",
    ipAddress: "192.168.1.104"
  },
  {
    id: "USR-003",
    name: "David Kim",
    email: "david.kim@orr.solutions",
    role: "operator",
    department: "Client Services",
    status: "ACTIVE",
    lastActive: "3 hours ago",
    ipAddress: "192.168.1.112"
  },
  {
    id: "USR-004",
    name: "Emily Stone",
    email: "emily.stone@orr.solutions",
    role: "content_editor",
    department: "Marketing & Strategy",
    status: "ACTIVE",
    lastActive: "Yesterday",
    ipAddress: "192.168.1.155"
  },
  {
    id: "USR-005",
    name: "Jonathan Vance",
    email: "jonathan.vance@orr.solutions",
    role: "admin",
    department: "Financial Relations",
    status: "SUSPENDED",
    lastActive: "3 weeks ago",
    ipAddress: "192.168.2.22"
  }
];

export default function RoleManagementPage() {
  const { user } = useAuthStore();
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_manage_roles;

  // State Management
  const [usersList, setUsersList] = useState<AdminUserRecord[]>(initialAdminUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  
  // Matrix State (initialize from permissions file)
  const [matrix, setMatrix] = useState<Record<RoleName, Permission[]>>(ROLE_PERMISSIONS);
  const [matrixModified, setMatrixModified] = useState(false);

  // Destructive Actions State
  const [suspendingUser, setSuspendingUser] = useState<AdminUserRecord | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [elevatingUser, setElevatingUser] = useState<AdminUserRecord | null>(null);

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
              You do not possess the required digital authorization credentials (<span className="text-red-400 font-mono text-xs">can_manage_roles</span>) to modify administrator profiles or access systems.
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

  // Filter lists
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle permission in the matrix
  const handleMatrixToggle = (role: RoleName, permission: Permission) => {
    // Prevent modifying super_admin permissions (always possesses everything)
    if (role === "super_admin") return;

    const currentPermissions = matrix[role] || [];
    let updatedPermissions: Permission[];

    if (currentPermissions.includes(permission)) {
      updatedPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      updatedPermissions = [...currentPermissions, permission];
    }

    setMatrix({
      ...matrix,
      [role]: updatedPermissions
    });
    setMatrixModified(true);
  };

  const handleSaveMatrix = () => {
    setMatrixModified(false);
    // Visual notification could go here - mock success
    alert("Role Authorization Matrix policy has been globally reconfigured and pushed to directory services!");
  };

  const handleSuspendClick = (admin: AdminUserRecord) => {
    setSuspendingUser(admin);
    setConfirmInput("");
    setConfirmError("");
  };

  const handleConfirmSuspend = () => {
    if (confirmInput.toUpperCase() !== "SUSPEND") {
      setConfirmError("Incorrect keyword. Please type SUSPEND exactly.");
      return;
    }

    if (suspendingUser) {
      setUsersList(prev => prev.map(u => 
        u.id === suspendingUser.id 
          ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : u
      ));
      
      // Log audit
      try {
        const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
        const newAudit = {
          id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
          username: user?.full_name || user?.username || "Super Admin",
          user_full_name: user?.full_name || user?.username || "Super Admin",
          action: suspendingUser.status === "ACTIVE" ? "SUSPEND_USER" : "REINSTATE_USER",
          model_name: "AdminUser",
          object_id: suspendingUser.id,
          description: `${suspendingUser.status === "ACTIVE" ? "Suspended" : "Reinstated"} administrative user account ${suspendingUser.name} (${suspendingUser.email}).`,
          ip_address: "192.168.1.1",
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('orr_admin_audit_logs', JSON.stringify([newAudit, ...auditLogs]));
      } catch (e) {}

      setSuspendingUser(null);
    }
  };

  const handleElevateRole = (admin: AdminUserRecord, newRole: RoleName) => {
    setUsersList(prev => prev.map(u => 
      u.id === admin.id ? { ...u, role: newRole } : u
    ));

    // Log audit
    try {
      const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
      const newAudit = {
        id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
        username: user?.full_name || user?.username || "Super Admin",
        user_full_name: user?.full_name || user?.username || "Super Admin",
        action: "CHANGE_ROLE",
        model_name: "AdminUser",
        object_id: admin.id,
        description: `Modified role for user ${admin.name} from ${admin.role} to ${newRole}.`,
        ip_address: "192.168.1.1",
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('orr_admin_audit_logs', JSON.stringify([newAudit, ...auditLogs]));
    } catch (e) {}
  };

  const permissionsList: { name: Permission; display: string; desc: string }[] = [
    { name: "can_manage_roles", display: "Manage Security Roles", desc: "Allows full configuration of role directory & permissions matrix." },
    { name: "can_approve_sensitive_actions", display: "Approve Operations", desc: "Dual-approval reviewer for sensitive deletions/migrations." },
    { name: "can_view_security_events", display: "Monitor Active Threat Streams", desc: "View real-time threat maps, diagnostics, and force revokes." },
    { name: "can_view_audit_logs", display: "Inspect Audits", desc: "Access standard enterprise-wide immutable security logs." },
    { name: "can_configure_system", display: "Configure Core Options", desc: "Allows deep system backups, toggles, maintenance window settings." },
    { name: "can_view_billing", display: "View Financial Records", desc: "Access subscriptions, invoice logs, disputes, and credits." },
    { name: "can_edit_clients", display: "Modify Client Profiles", desc: "Full edit credentials over operational workspaces and company charts." }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh]">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-1">
            Enterprise RBAC
          </span>
          <h1 className="text-3xl font-black tracking-tight">Identity & Role Management</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Configure system authorization parameters. Manage individual administrator roles, suspend compromise threats, and re-compile the granular permissions matrix.
          </p>
        </div>
      </div>

      {/* Grid: User Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Administrator Table */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              Administrative Directory
            </h3>
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary/40 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="pb-3 pl-2">Administrator</th>
                  <th className="pb-3">Security Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((admin) => (
                  <tr key={admin.id} className="text-xs group hover:bg-white/5 transition-colors">
                    {/* User profile cell */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-300">
                          {admin.name[0]}
                        </div>
                        <div>
                          <span className="font-extrabold text-sm block">{admin.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{admin.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role selector dropdown cell */}
                    <td className="py-4 font-semibold text-slate-300">
                      <select 
                        value={admin.role}
                        onChange={(e) => handleElevateRole(admin, e.target.value as RoleName)}
                        disabled={admin.role === "super_admin" && usersList.filter(u => u.role === "super_admin").length === 1}
                        className="bg-slate-950/80 border border-white/10 rounded-lg text-[11px] font-bold px-2 py-1 focus:outline-none focus:border-primary/50 text-white cursor-pointer"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Administrator</option>
                        <option value="operator">Operator</option>
                        <option value="content_editor">Content Editor</option>
                      </select>
                    </td>

                    {/* Status badge cell */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider ${
                        admin.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {admin.status}
                      </span>
                    </td>

                    {/* Suspend action cell */}
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleSuspendClick(admin)}
                        disabled={admin.id === "USR-001"} // CISO cannot suspend self
                        className={`p-2 rounded-lg border transition cursor-pointer ${
                          admin.status === "ACTIVE" 
                            ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400" 
                            : "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400"
                        } disabled:opacity-30 disabled:pointer-events-none`}
                        title={admin.status === "ACTIVE" ? "Suspend Administrator" : "Reinstate Administrator"}
                      >
                        <UserX size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Hand: Permissions Matrix Grid */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 flex flex-col justify-between backdrop-blur-sm relative">
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                Permissions Policy Matrix
              </h3>
              
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
            </div>

            {/* Quick Helper Alert */}
            <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl flex gap-3 text-slate-400 leading-relaxed text-xs">
              <Info className="text-primary flex-shrink-0 mt-0.5" size={14} />
              <p>
                Permissions modified below dynamically overwrite the local role directory. The role <strong className="text-slate-200 font-bold">super_admin</strong> possesses bypass privileges and retains all access.
              </p>
            </div>

            {/* Matrix View */}
            <div className="space-y-4">
              {permissionsList.map((perm) => (
                <div 
                  key={perm.name}
                  className="bg-slate-950/20 p-4 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition"
                >
                  <div className="space-y-0.5 max-w-xs">
                    <span className="font-extrabold text-xs block text-white">{perm.display}</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">{perm.desc}</span>
                  </div>

                  <div className="flex items-center gap-3.5 w-full md:w-auto justify-end">
                    {/* Role check badges */}
                    {(["admin", "operator", "content_editor"] as RoleName[]).map(role => {
                      const hasPerm = matrix[role]?.includes(perm.name);
                      return (
                        <button
                          key={role}
                          onClick={() => handleMatrixToggle(role, perm.name)}
                          className={`flex flex-col items-center gap-1.5 py-1.5 px-3 rounded-xl border select-none transition-all w-16 cursor-pointer active:scale-95 ${
                            hasPerm 
                              ? "bg-primary/10 border-primary/30 text-primary" 
                              : "border-white/5 text-slate-600 hover:border-white/20 hover:text-slate-400"
                          }`}
                          title={`Toggle ${perm.display} for ${role.replace("_", " ")}`}
                        >
                          <span className="text-[8px] font-black uppercase tracking-wider">{role.split("_")[0]}</span>
                          {hasPerm ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Controls */}
          {matrixModified && (
            <div className="pt-6 border-t border-white/5 animate-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={handleSaveMatrix}
                className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-black py-3 rounded-xl transition text-xs shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Commit Policy Changes & Sync
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Account Suspension Confirmation Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900/80 border border-red-500/30 backdrop-blur-2xl p-8 rounded-[2rem] text-center space-y-6 shadow-2xl relative">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                {suspendingUser.status === "ACTIVE" ? "Suspend Account" : "Reinstate Account"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm updating directory credentials for <span className="font-mono text-slate-200">{suspendingUser.name}</span>. This instantly blocks all administrative portal dashboard operations!
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Type <strong className="text-red-400 uppercase">SUSPEND</strong> to commit this action.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type SUSPEND to confirm"
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 focus:border-red-500/50 rounded-xl text-center text-sm font-bold tracking-widest text-white uppercase focus:outline-none transition-colors"
              />
              {confirmError && (
                <span className="text-[10px] font-bold text-red-400 text-center block">{confirmError}</span>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl transition text-xs shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Execute State Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
