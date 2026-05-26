"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import { 
  ShieldAlert, 
  Settings, 
  Database, 
  Shield, 
  Lock, 
  RefreshCw, 
  Server, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Clock,
  Sliders,
  Play
} from "lucide-react";

export default function SystemConfigurationPage() {
  const { user } = useAuthStore();
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_configure_system;

  // Security Toggles State
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [strictInterceptor, setStrictInterceptor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("1h");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [verboseLogging, setVerboseLogging] = useState(false);
  const [ipWhiteList, setIpWhiteList] = useState(false);

  // Backup progress state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Overwrite state policy alert
  const [policyModified, setPolicyModified] = useState(false);

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
              You do not possess the required digital authorization credentials (<span className="text-red-400 font-mono text-xs">can_configure_system</span>) to access global administrative system parameters.
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

  const handleBackupSubmit = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupSuccess(false);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          setBackupSuccess(true);
          
          // Log to simulated global audit log
          try {
            const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
            const newAudit = {
              id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
              username: user?.full_name || user?.username || "Super Admin",
              user_full_name: user?.full_name || user?.username || "Super Admin",
              action: "BACKUP_SUCCESS",
              model_name: "ManualBackup",
              object_id: `db-snapshot-manual-${Math.floor(Math.random() * 1000)}`,
              description: `Manually triggered full database backup snapshot successfully completed. Database allocation audited at 248.4 MB. Snapshot uploaded to AWS vault.`,
              ip_address: "192.168.1.1",
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('orr_admin_audit_logs', JSON.stringify([newAudit, ...auditLogs]));
          } catch (e) {}

          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleSavePolicy = () => {
    setPolicyModified(false);
    
    // Log configuration rewrite
    try {
      const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
      const newAudit = {
        id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
        username: user?.full_name || user?.username || "Super Admin",
        user_full_name: user?.full_name || user?.username || "Super Admin",
        action: "SYSTEM_RECONFIG",
        model_name: "SystemConfig",
        object_id: "global-settings",
        description: `Modified administrative system parameters: Strict API Error Handlers = ${strictInterceptor}, MFA Enforcement = ${mfaEnforced}, Maintenance Mode = ${maintenanceMode}.`,
        ip_address: "192.168.1.1",
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('orr_admin_audit_logs', JSON.stringify([newAudit, ...auditLogs]));
    } catch (e) {}

    alert("Administrative platform settings successfully reconfigured & committed to system environment variables.");
  };

  const toggleSwitch = (value: boolean, setter: (val: boolean) => void) => {
    setter(!value);
    setPolicyModified(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh]">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              System Parameters
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">System Configuration</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Deep security configuration console. Tweak administrative global session parameters, network IP white-lists, and manually compile full database backups.
          </p>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: System Parameter Settings Matrix */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm relative">
          <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-white/5 pb-4">
            <Sliders size={18} className="text-primary" />
            Security & Operations Settings
          </h3>

          <div className="space-y-6">
            
            {/* Setting: MFA */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white">Enforce MFA Session Validation</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Require standard administrators to double-authenticate via security keys during operations.
                </span>
              </div>
              <button 
                onClick={() => toggleSwitch(mfaEnforced, setMfaEnforced)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  mfaEnforced ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  mfaEnforced ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting: Strict Interceptor */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white">Strict 401 Interceptor Validation</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Globally evaluate error query responses in the API client and forcefully evict on threat patterns.
                </span>
              </div>
              <button 
                onClick={() => toggleSwitch(strictInterceptor, setStrictInterceptor)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  strictInterceptor ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  strictInterceptor ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting: Maintenance Mode */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white text-amber-400">Simulate Maintenance Mode</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Lock standard workspace dashboard logins and display a strict maintenance warning screen.
                </span>
              </div>
              <button 
                onClick={() => toggleSwitch(maintenanceMode, setMaintenanceMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting: Verbose Logging */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white">Verbose Telemetry Debug Logging</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Enable logging payload parameters inside standard console panels in non-production instances.
                </span>
              </div>
              <button 
                onClick={() => toggleSwitch(verboseLogging, setVerboseLogging)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  verboseLogging ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  verboseLogging ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setting: IP WhiteList */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white">Restrict Security IP CIDR Bounds</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Block administrative session logins outside matching pre-configured corporate VPN IP boundaries.
                </span>
              </div>
              <button 
                onClick={() => toggleSwitch(ipWhiteList, setIpWhiteList)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  ipWhiteList ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  ipWhiteList ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Selector: Session Timeout */}
            <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-2xl hover:border-white/10 transition">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-extrabold text-xs block text-white">Automated Token Expiration Threshold</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Automatically invalidate and revoke client sessions after a period of administrative inactivity.
                </span>
              </div>
              <select 
                value={sessionTimeout}
                onChange={(e) => { setSessionTimeout(e.target.value); setPolicyModified(true); }}
                className="bg-slate-950 border border-white/10 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:border-primary/50 text-white cursor-pointer"
              >
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="12h">12 Hours</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>

          </div>

          {/* Settings Save Panel */}
          {policyModified && (
            <div className="pt-6 border-t border-white/5 animate-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={handleSavePolicy}
                className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-black py-3 rounded-xl transition text-xs shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Apply Security Posture Override
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Database Snapshots & backups */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* DB Allocation Card */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm relative">
            <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-white/5 pb-4">
              <Database size={18} className="text-primary" />
              Secure Data Snapshots
            </h3>

            <div className="space-y-6">
              
              {/* Allocation Stats */}
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Ledger Database Allocation</span>
                  <span className="text-2xl font-black block text-white">248.4 MB</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-primary font-mono text-xs font-bold">
                  PostgreSQL 15
                </div>
              </div>

              {/* Progress Backup Bar */}
              {isBackingUp && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                    <span>Backing up database snapshot...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(14,194,119,0.5)]"
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Badge */}
              {backupSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-3 text-emerald-400 leading-relaxed text-xs animate-in slide-in-from-top-2 duration-300 font-bold">
                  <CheckCircle className="flex-shrink-0" size={16} />
                  <p>Database backup compiled successfully and uploaded securely to snapshot repositories.</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleBackupSubmit}
                  disabled={isBackingUp}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700/50 disabled:opacity-50"
                >
                  <Play size={12} className="text-primary fill-primary" />
                  Trigger Secure Backup
                </button>
                
                <button
                  className="w-full py-3.5 bg-slate-950 border border-white/5 hover:border-white/10 text-slate-300 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => alert("Downloading secure crypt snapshot zip snapshot_db_248MB.gz.gpg...")}
                >
                  <Download size={12} className="text-slate-400" />
                  Download Encryption Snapshot
                </button>
              </div>

            </div>
          </div>

          {/* Warnings Security parameters alerts box */}
          <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} />
              <h4 className="font-extrabold text-sm text-white">Compliance Warning</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Warning: Globally overriding active parameters bypasses standard dual-approval validation checks. Action logging is strictly logged and attributed to user ID <span className="font-mono text-slate-300">{user?.username}</span> in accordance with SOC2 diagnostic compliance guidelines.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
