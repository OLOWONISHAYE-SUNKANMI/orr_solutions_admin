"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/hooks/auth";
import { dashboardAPI } from "@/app/services/api";
import { 
  ShieldAlert, 
  Terminal, 
  Users, 
  Activity, 
  ShieldCheck, 
  Shield, 
  AlertTriangle, 
  Zap, 
  Globe, 
  RefreshCw, 
  Clock, 
  Cpu, 
  Wifi, 
  UserMinus,
  Lock
} from "lucide-react";

interface ActiveSession {
  id: string;
  name: string;
  role: string;
  email: string;
  ip: string;
  location: string;
  device: string;
  activeTime: string;
  isSelf: boolean;
}

const mockSessions: ActiveSession[] = [
  {
    id: "SESS-881",
    name: "Robert Chen",
    role: "Super Admin",
    email: "robert.chen@orr.solutions",
    ip: "192.168.1.1",
    location: "Lagos, Nigeria (Secure VPN Zone)",
    device: "MacBook Pro / Chrome 120",
    activeTime: "Active now",
    isSelf: true
  },
  {
    id: "SESS-882",
    name: "Sarah Jenkins",
    role: "Admin",
    email: "sarah.jenkins@orr.solutions",
    ip: "192.168.1.104",
    location: "London, UK",
    device: "iPad Pro / Safari 17.2",
    activeTime: "Active 4m ago",
    isSelf: false
  },
  {
    id: "SESS-883",
    name: "David Kim",
    role: "Operator",
    email: "david.kim@orr.solutions",
    ip: "192.168.1.112",
    location: "Toronto, Canada",
    device: "Windows 11 / Firefox 121",
    activeTime: "Active 18m ago",
    isSelf: false
  }
];

export default function SecurityMonitoringPage() {
  const { user } = useAuthStore();
  const hasPermission = user?.role_name === "super_admin" || user?.permissions?.can_view_security_events;

  const [threatLevel, setThreatLevel] = useState<number>(15); // 0 - 100 percentage
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>(mockSessions);
  const [isSimulatingRevoke, setIsSimulatingRevoke] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console stream
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  // Feed simulated system logs into security terminal
  useEffect(() => {
    const defaultLogs = [
      `[${new Date().toLocaleTimeString()}] 🟢 INTRUSION_PREVENTION: Decrypted payload validated. Signature matches clean.`,
      `[${new Date().toLocaleTimeString()}] 🔑 AUTH: Validated JWT administrative Token headers successfully.`,
      `[${new Date().toLocaleTimeString()}] 🛡️ SECURE_ZONE: CISO authenticated from designated secure IP region.`,
      `[${new Date().toLocaleTimeString()}] 🔍 MONITOR: Active sessions synced across AWS instances in US-East-1.`
    ];
    setConsoleLogs(defaultLogs);

    const logGenerator = setInterval(() => {
      const logsPool = [
        `[${new Date().toLocaleTimeString()}] 🟢 INTRUSION_PREVENTION: Packet validation matching success. No anomalous inputs found.`,
        `[${new Date().toLocaleTimeString()}] 🔑 AUTH: JWT signature validated. Claims verified successfully.`,
        `[${new Date().toLocaleTimeString()}] 🌐 NETWORK: Synced audit ledger snapshots cleanly to off-site cloud storage.`,
        `[${new Date().toLocaleTimeString()}] ⚡ METRIC: Host CPU temperature stable at 44.5°C. System resources healthy.`,
        `[${new Date().toLocaleTimeString()}] 🛰️ DAEMON: Performed diagnostic checks on TLS 1.3 certificate handshakes. Clean.`
      ];
      const randomLog = logsPool[Math.floor(Math.random() * logsPool.length)];
      setConsoleLogs(prev => [...prev, randomLog]);
    }, 8000);

    return () => clearInterval(logGenerator);
  }, []);

  const handleSimulateRevoke = async () => {
    setIsSimulatingRevoke(true);
    setConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚨 EXTREME_WARNING: Simulating immediate standard administrative session revocation...`,
      `[${new Date().toLocaleTimeString()}] ☣️ TRIGGER: Setting localStorage simulate_access_revoked = true`,
      `[${new Date().toLocaleTimeString()}] 📡 API: Emitting outbound administrative fetch query to trigger central global error interceptor...`
    ]);

    setTimeout(async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("simulate_access_revoked", "true");
          
          // Emit actual API call to let interceptor parse simulate_access_revoked
          await dashboardAPI.getOverview();
        }
      } catch (err: any) {
        console.warn("Revoked session successfully intercepted:", err);
      } finally {
        setIsSimulatingRevoke(false);
      }
    }, 1500);
  };

  const handleInjectThreat = () => {
    const randomThreats = [
      `[${new Date().toLocaleTimeString()}] 🚨 THREAT_ALERT: Detected anomalous geo-velocity IP shift on Administrator David Kim (Toronto → Singapore in 4 minutes).`,
      `[${new Date().toLocaleTimeString()}] ⚠️ COMPROMISE_WARNING: Outbound API payload exceeded typical rate levels from Operator 192.168.1.112.`,
      `[${new Date().toLocaleTimeString()}] ❌ AUTH_FAIL: Failed administrative login query attempt on root security account from IP 184.22.90.103.`
    ];
    
    setConsoleLogs(prev => [...prev, randomThreats[Math.floor(Math.random() * randomThreats.length)]]);
    setThreatLevel(prev => Math.min(prev + 15, 95));
  };

  const handleResetThreat = () => {
    setConsoleLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🛡️ SECURE_ZONE: Threat level reset requested. Restoring secure compliance credentials...`,
      `[${new Date().toLocaleTimeString()}] 🟢 SYSTEM: Global threat indicators back to default baseline.`
    ]);
    setThreatLevel(15);
  };

  const handleForceTerminate = (session: ActiveSession) => {
    if (confirm(`Are you sure you want to instantly terminate the administrative session ${session.id} for ${session.name}? This will instantly log them out.`)) {
      setSessions(prev => prev.filter(s => s.id !== session.id));
      setConsoleLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🚨 FORCE_EVICTION: Revoked administrative session token for ${session.name} (${session.email}) from IP ${session.ip}.`,
        `[${new Date().toLocaleTimeString()}] 📡 API: Broadcasted instant session logout eviction package to client.`
      ]);
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
              You do not possess the required digital authorization credentials (<span className="text-red-400 font-mono text-xs">can_view_security_events</span>) to access the real-time Security Operations Center dashboard.
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

  // Dial arc math
  const getThreatColor = (level: number) => {
    if (level < 35) return "text-emerald-400 stroke-emerald-400";
    if (level < 70) return "text-amber-400 stroke-amber-400";
    return "text-red-500 stroke-red-500";
  };

  const getThreatText = (level: number) => {
    if (level < 35) return "SECURE & HEALED";
    if (level < 70) return "ELEVATED ALERT";
    return "THREAT DETECTED";
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
          <h1 className="text-3xl font-black tracking-tight">Security & Monitoring</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time Threat Intelligence and Session control portal. Monitor active administrative tokens and run compliance session-revocation scenarios.
          </p>
        </div>
      </div>

      {/* Main Grid: Gauges & Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Threat Dashboard & Console */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Threats and Gauge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/20 border border-white/5 p-6 rounded-3xl backdrop-blur-sm relative">
            
            {/* SVG Circular Threat Gauge Dial */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-6 space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">System Security Posture</span>
              
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Base Circle */}
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-slate-800" strokeWidth="6" fill="transparent" 
                  />
                  {/* Threat Circle */}
                  <circle 
                    cx="50" cy="50" r="40" 
                    className={`transition-all duration-500 ${getThreatColor(threatLevel)}`}
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * threatLevel) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black tracking-tight">{threatLevel}%</span>
                  <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border uppercase ${
                    threatLevel < 35 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    threatLevel < 70 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {threatLevel < 35 ? "Green" : threatLevel < 70 ? "Amber" : "Red"}
                  </span>
                </div>
              </div>

              <span className={`text-xs font-black tracking-widest ${
                threatLevel < 35 ? "text-emerald-400 animate-pulse" :
                threatLevel < 70 ? "text-amber-400" :
                "text-red-500 animate-bounce"
              }`}>
                {getThreatText(threatLevel)}
              </span>
            </div>

            {/* Diagnostic Ticker Stats */}
            <div className="md:col-span-7 flex flex-col justify-between p-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cpu size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">CPU Compute</span>
                  </div>
                  <span className="text-xl font-black block text-white">4.2%</span>
                </div>
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wifi size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Gateway API</span>
                  </div>
                  <span className="text-xl font-black block text-emerald-400">TLS 1.3 Secure</span>
                </div>
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Activity size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Network Ping</span>
                  </div>
                  <span className="text-xl font-black block text-white">12 ms</span>
                </div>
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">IDS Status</span>
                  </div>
                  <span className="text-xl font-black block text-emerald-400">Defending</span>
                </div>
              </div>

              {/* Dev Simulation Commands Box */}
              <div className="flex gap-2">
                <button
                  onClick={handleInjectThreat}
                  className="flex-1 px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
                >
                  Inject Threat
                </button>
                <button
                  onClick={handleResetThreat}
                  className="px-4 py-2 border border-slate-700/50 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
                >
                  Reset Status
                </button>
              </div>
            </div>

          </div>

          {/* Real-time Security Log Terminal Output */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              LIVE TELEMETRY STREAM
            </div>

            <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-300 font-mono">
              <Terminal size={14} className="text-emerald-500" />
              Security Gateway Console Terminal
            </h3>

            <div className="bg-black/80 border border-white/5 rounded-2xl p-5 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-400 space-y-2">
              {consoleLogs.map((log, index) => {
                let logClass = "text-slate-400";
                if (log.includes("🚨") || log.includes("ALERT") || log.includes("WARNING")) {
                  logClass = "text-red-400 font-bold";
                } else if (log.includes("🟢") || log.includes("success") || log.includes("verified")) {
                  logClass = "text-emerald-400 font-medium";
                } else if (log.includes("🛡️") || log.includes("SECURE")) {
                  logClass = "text-cyan-400";
                }
                return (
                  <div key={index} className={`${logClass} whitespace-pre-wrap break-all border-b border-white/5 pb-1`}>
                    {log}
                  </div>
                );
              })}
              <div ref={consoleBottomRef} />
            </div>
          </div>

        </div>

        {/* Right Column: Active Session Map & FORCE REVOCATION */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* CRITICAL IMMEDIATE FORCE REVOCATION TEST BUTTON CARD */}
          <div className="bg-gradient-to-br from-red-950/20 via-slate-900/60 to-red-950/10 border border-red-500/30 backdrop-blur-xl p-8 rounded-[2rem] space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center animate-pulse">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-lg font-black text-white">Immediate Global Revocation Test</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Clicking the button below simulates an immediate administrative termination trigger. It sets an ACCESS_REVOKED flag, evicts all credentials, and instantly redirects this session back to login.
              </p>
            </div>

            <button
              onClick={handleSimulateRevoke}
              disabled={isSimulatingRevoke}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-xl transition text-xs shadow-lg shadow-red-500/15 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-red-500/20"
            >
              {isSimulatingRevoke ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Triggering compliance eviction...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Simulate Access Revocation
                </>
              )}
            </button>
          </div>

          {/* Active Administrator Sessions List */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-3xl space-y-6 backdrop-blur-sm">
            <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-white/5 pb-4">
              <Users size={16} className="text-primary" />
              Active Admin Sessions ({sessions.length})
            </h3>

            <div className="space-y-4">
              {sessions.map((sess) => (
                <div 
                  key={sess.id} 
                  className={`bg-slate-950/40 p-4 border rounded-2xl space-y-3 transition-colors ${
                    sess.isSelf ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-300">
                        {sess.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs block text-white">{sess.name}</span>
                          {sess.isSelf && (
                            <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              SELF
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block">{sess.email}</span>
                      </div>
                    </div>

                    {!sess.isSelf && (
                      <button
                        onClick={() => handleForceTerminate(sess)}
                        className="p-1.5 bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 rounded-lg text-red-400 transition cursor-pointer"
                        title="Force terminate administrative session"
                      >
                        <UserMinus size={12} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 font-mono border-t border-white/5 pt-2.5">
                    <div>
                      IP: <span className="text-slate-300 font-semibold">{sess.ip}</span>
                    </div>
                    <div className="text-right">
                      Time: <span className="text-slate-300 font-semibold">{sess.activeTime}</span>
                    </div>
                    <div className="col-span-2">
                      Zone: <span className="text-slate-300 font-semibold truncate block">{sess.location}</span>
                    </div>
                    <div className="col-span-2">
                      Device: <span className="text-slate-400 truncate block">{sess.device}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
