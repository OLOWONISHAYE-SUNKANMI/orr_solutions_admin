"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import api from "@/app/services/api";
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

export default function RoleManagementPage() {
  const { user } = useAuthStore();
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_manage_roles;

  // State Management
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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

  useEffect(() => {
    if (hasPermission) {
      fetchData();
    }
  }, [hasPermission]);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.settings.listUsers(),
        api.settings.listRoles(),
      ]) as [any, any];

      const usersData = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data?.results || usersResponse?.data || usersResponse?.results || []);
      const rolesData = Array.isArray(rolesResponse) ? rolesResponse : (rolesResponse?.data?.results || rolesResponse?.data || rolesResponse?.results || []);

      setRolesList(rolesData);

      // Construct matrix from rolesData
      const newMatrix: Record<RoleName, Permission[]> = {
        super_admin: [],
        admin: [],
        project_manager: [],
        consultant: [],
      };

      const permissionKeys: Permission[] = [
        'can_manage_users', 'can_view_all_clients', 'can_edit_clients', 'can_manage_tickets',
        'can_manage_meetings', 'can_create_content', 'can_publish_content', 'can_view_analytics',
        'can_view_billing', 'can_manage_settings', 'can_view_ai_logs', 'can_manage_roles',
        'can_view_audit_logs', 'can_view_security_events', 'can_approve_sensitive_actions',
        'can_configure_system'
      ];

      rolesData.forEach((roleObj: any) => {
        const roleName = roleObj.name as RoleName;
        if (roleName) {
          const permissionsArray: Permission[] = [];
          permissionKeys.forEach(key => {
            if (roleObj[key] === true) {
              permissionsArray.push(key);
            }
          });
          newMatrix[roleName] = permissionsArray;
        }
      });
      
      setMatrix(newMatrix);
      setMatrixModified(false);

      // Convert backend users (admin profiles) to AdminUserRecord
      const formattedUsers: AdminUserRecord[] = usersData.map((profile: any) => {
        const status: "ACTIVE" | "SUSPENDED" = profile.is_active ? "ACTIVE" : "SUSPENDED";
        
        const matchingRole = rolesData.find((r: any) => r.id === profile.role || r.name === profile.role_name || r.name === profile.role);
        const roleName: RoleName = matchingRole 
          ? (matchingRole.name as RoleName) 
          : (profile.role_name as RoleName || profile.role as RoleName || "project_manager");

        return {
          id: String(profile.user_id || profile.id),
          name: profile.full_name || profile.username || "Anonymous Admin",
          email: profile.email || "",
          role: roleName,
          department: profile.department || "General Operations",
          status,
          lastActive: profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never",
          ipAddress: profile.last_login_ip || "N/A",
        };
      });

      setUsersList(formattedUsers);
    } catch (error) {
      console.error("[FETCH DATA ERROR] Failed to fetch RBAC directory:", error);
      setErrorMessage("System authorization error: failed to fetch RBAC directory services.");
    } finally {
      setIsLoading(false);
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

  const handleSaveMatrix = async () => {
    setIsLoading(true);
    try {
      const targetRoles: RoleName[] = ["admin", "project_manager", "consultant"];
      
      const permissionKeys: Permission[] = [
        'can_manage_users', 'can_view_all_clients', 'can_edit_clients', 'can_manage_tickets',
        'can_manage_meetings', 'can_create_content', 'can_publish_content', 'can_view_analytics',
        'can_view_billing', 'can_manage_settings', 'can_view_ai_logs', 'can_manage_roles',
        'can_view_audit_logs', 'can_view_security_events', 'can_approve_sensitive_actions',
        'can_configure_system'
      ];

      await Promise.all(
        targetRoles.map(roleName => {
          const roleObj = rolesList.find(r => r.name === roleName);
          if (!roleObj) return Promise.resolve();

          const permissionsDict: Record<string, boolean> = {};
          
          permissionKeys.forEach(key => {
            permissionsDict[key] = matrix[roleName]?.includes(key) || false;
          });

          return api.roleManagement.updateRolePermissions(roleObj.id, permissionsDict);
        })
      );

      setMatrixModified(false);
      await fetchData();
      alert("Role Authorization Matrix policy has been globally reconfigured and pushed to directory services!");
    } catch (error) {
      console.error("[MATRIX UPDATE ERROR]", error);
      alert("Failed to commit Matrix policies. Ensure SOC2 directory master bypass is authorized.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendClick = (admin: AdminUserRecord) => {
    setSuspendingUser(admin);
    setConfirmInput("");
    setConfirmError("");
  };

  const handleConfirmSuspend = async () => {
    if (confirmInput.toUpperCase() !== "SUSPEND") {
      setConfirmError("Incorrect keyword. Please type SUSPEND exactly.");
      return;
    }

    if (suspendingUser) {
      setIsLoading(true);
      try {
        const isCurrentlyActive = suspendingUser.status === "ACTIVE";
        
        if (isCurrentlyActive) {
          await api.roleManagement.deactivateUser(Number(suspendingUser.id));
        } else {
          await api.roleManagement.editUser(Number(suspendingUser.id), {
            user: {
              is_active: true
            }
          });
        }

        setSuspendingUser(null);
        await fetchData();
        alert(`Administrator account status successfully updated!`);
      } catch (error) {
        console.error("[SUSPENSION ERROR]", error);
        alert("Failed to modify administrator directory status. System security bypass blocked.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleElevateRole = async (admin: AdminUserRecord, newRole: RoleName) => {
    setIsLoading(true);
    try {
      const matchingRole = rolesList.find(r => r.name === newRole);

      await api.roleManagement.editUser(Number(admin.id), {
        profile: {
          role_name: newRole,
          role: matchingRole ? matchingRole.id : undefined
        }
      });

      await fetchData();
      alert(`Security Role for administrator ${admin.name} successfully updated to ${newRole.toUpperCase()}.`);
    } catch (error) {
      console.error("[ROLE ELEVATION ERROR]", error);
      alert("Failed to elevate administrator's role. Verify you possess adequate SOC2 elevation clearance.");
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading && usersList.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh]">
        {/* Header Panel Skeleton */}
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl space-y-4 animate-pulse">
          <div className="h-4 w-28 bg-slate-800 rounded-full" />
          <div className="h-8 w-80 bg-slate-800 rounded-full" />
          <div className="h-4 w-full bg-slate-800/60 rounded-full" />
        </div>

        {/* Directory Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-slate-800 rounded-full" />
            <div className="space-y-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-slate-800 rounded-full" />
                      <div className="h-2 w-48 bg-slate-800/60 rounded-full" />
                    </div>
                  </div>
                  <div className="h-5 w-24 bg-slate-800 rounded-lg" />
                  <div className="h-4 w-12 bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-slate-800 rounded-full" />
            <div className="space-y-4 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 pb-4 last:border-0">
                  <div className="space-y-2">
                    <div className="h-3 w-40 bg-slate-800 rounded-full" />
                    <div className="h-2 w-64 bg-slate-800/60 rounded-full" />
                  </div>
                  <div className="h-4 w-4 bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh]">
      
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 text-red-400 text-xs font-bold animate-in fade-in duration-300">
          <AlertTriangle className="flex-shrink-0" size={16} />
          <p>{errorMessage}</p>
        </div>
      )}

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[2rem] transition-all duration-300">
            <RefreshCw className="animate-spin text-primary animate-spin-slow" size={32} />
          </div>
        )}
        
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
                        disabled={Number(admin.id) === user?.id || (admin.role === "super_admin" && usersList.filter(u => u.role === "super_admin").length === 1)}
                        className="bg-slate-950/80 border border-white/10 rounded-lg text-[11px] font-bold px-2 py-1 focus:outline-none focus:border-primary/50 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Administrator</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="consultant">Consultant</option>
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
                        disabled={Number(admin.id) === user?.id} // Cannot suspend self
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
                    {(["admin", "project_manager", "consultant"] as RoleName[]).map(role => {
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
