"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Globe, 
  DollarSign, 
  User, 
  Lock, 
  Bell, 
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Database,
  Cloud,
  Webhook,
  Activity,
  Search,
  FileText
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { ROLE_PERMISSIONS, Permission, RoleName } from '@/lib/rbac/permissions';
import { useRole, useIsSuperAdmin } from '@/lib/rbac/hooks';
import TwoFactorSetup from '@/app/components/admin/TwoFactorSetup';

type SettingsTab = 'general' | 'localization' | 'permissions' | 'security' | 'system' | 'templates';

export default function SettingsPage() {
  const { t, language, setLanguage, currency, setCurrency } = useLanguageStore();
  const currentRole = useRole();
  const isSuperAdmin = useIsSuperAdmin();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'permissions', label: 'Role Permissions', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'system', label: 'System', icon: HardDrive },
    { id: 'templates', label: 'Letterhead Templates', icon: FileText },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const renderGeneral = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">System Name</label>
          <input 
            type="text" 
            defaultValue="ORR Solutions Operations Hub" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Support Email</label>
          <input 
            type="email" 
            defaultValue="support@orr.solutions" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
            <p className="text-xs text-slate-500">Temporarily disable portal access for clients</p>
          </div>
          <button className="w-12 h-6 bg-white/10 rounded-full relative transition-colors">
            <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderLocalization = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Primary Language</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'en', label: 'English', flag: '🇺🇸' },
              { id: 'it', label: 'Italiano', flag: '🇮🇹' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  language === lang.id ? 'bg-primary/20 border-primary/50 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                <span className="text-sm font-bold">{lang.label}</span>
                <span className="text-xl">{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Operational Currency</label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'USD', label: 'US Dollar', symbol: '$' },
              { id: 'EUR', label: 'Euro', symbol: '€' },
              { id: 'GBP', label: 'British Pound', symbol: '£' }
            ].map((curr) => (
              <button
                key={curr.id}
                onClick={() => setCurrency(curr.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${
                  currency === curr.id ? 'bg-primary/20 border-primary/50 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                <span className="text-xl font-black text-primary">{curr.symbol}</span>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-tighter leading-none">{curr.id}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{curr.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <Globe className="text-blue-400" size={24} />
          <div>
            <h4 className="text-sm font-bold text-blue-400">Timezone Synchronization</h4>
            <p className="text-xs text-blue-400/60">System is currently synced with UTC (Universal Coordinated Time)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => {
    const roles: RoleName[] = ['super_admin', 'admin', 'operator', 'content_editor'];
    const permissions: Permission[] = [
      'can_manage_users',
      'can_view_all_clients',
      'can_edit_clients',
      'can_manage_tickets',
      'can_manage_meetings',
      'can_create_content',
      'can_publish_content',
      'can_view_analytics',
      'can_view_billing',
      'can_manage_settings',
      'can_view_ai_logs'
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-white">RBAC Matrix</h4>
            <p className="text-xs text-slate-500">Configure feature access per administrative role</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Lock size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Read-Only for non-Super Admins</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">Permission / Feature</th>
                {roles.map(role => (
                  <th key={role} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10 text-center">
                    {role.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-300 capitalize">{perm.replace('can_', '').replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">{perm}</p>
                  </td>
                  {roles.map(role => {
                    const hasPerm = ROLE_PERMISSIONS[role]?.includes(perm);
                    return (
                      <td key={`${role}-${perm}`} className="p-4 text-center">
                        <div className={`mx-auto w-5 h-5 rounded flex items-center justify-center ${
                          hasPerm ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-800 border border-transparent'
                        }`}>
                          {hasPerm && <CheckCircle2 size={12} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSecurity = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Lock size={20} />
            <h4 className="text-sm font-bold uppercase tracking-widest">Admin Authentication</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Require 2FA for all Staff</span>
              <button className="w-10 h-5 bg-primary/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Password Expiry (90 Days)</span>
              <button className="w-10 h-5 bg-white/10 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-slate-500 rounded-full" />
              </button>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10">
            <TwoFactorSetup />
          </div>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Activity size={20} />
            <h4 className="text-sm font-bold uppercase tracking-widest">Audit Policy</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Log Data Downloads</span>
              <button className="w-10 h-5 bg-primary/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">IP Address Tracking</span>
              <button className="w-10 h-5 bg-primary/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Database, label: 'Cloud Storage', status: '92% Full', color: 'rose' },
          { icon: Webhook, label: 'API Integrations', status: '12 Active', color: 'emerald' },
          { icon: Cloud, label: 'CDN Edge', status: 'Optimal', color: 'blue' }
        ].map((item, idx) => (
          <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-primary/30 transition-all">
             <div className={`p-3 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 w-fit mb-4`}>
                <item.icon className={`text-${item.color}-400`} size={20} />
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.label}</p>
             <h4 className="text-lg font-black text-white mt-1">{item.status}</h4>
          </div>
        ))}
      </div>

      <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <h4 className="text-sm font-bold text-rose-400 mb-2">Danger Zone</h4>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-rose-400/60 font-medium">Clear all system cache and rebuild assets. This may cause temporary performance degradation.</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
            <Trash2 size={14} /> Rebuild Cache
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white">Letterhead Templates</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage standard headers and footers for exports</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-all text-xs uppercase tracking-widest">
          <Plus size={16} />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
              <FileText size={24} />
            </div>
            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-[10px] font-black uppercase tracking-widest border border-primary/30">Default</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-2">Standard ORR Letterhead</h4>
          <p className="text-xs text-slate-400 mb-6 line-clamp-2">The default letterhead used for all standard client exports and official documents.</p>
          <div className="flex items-center gap-2">
            <button className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">Edit</button>
            <button className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-[#0a0f16] flex flex-col overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Settings size={14} /> System Configuration
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Global <span className="text-primary italic">Settings</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              Manage operational parameters, security protocols, and localization settings for the entire ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
             <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
             >
               {isSaving ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
               {isSaving ? 'Processing...' : 'Save Changes'}
             </button>
          </div>
        </div>

        {/* Settings Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar Tabs */}
          <aside className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all border ${
                  activeTab === tab.id 
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-xl shadow-primary/5' 
                  : 'bg-white/5 border-transparent text-slate-500 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} />
                <span className="uppercase tracking-widest text-[11px]">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeDot" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#A3E635]" />
                )}
              </button>
            ))}
          </aside>

          {/* Tab Content */}
          <main className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 min-h-[600px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      {tabs.find(t => t.id === activeTab)?.label}
                   </h3>
                   <div className="w-12 h-1 bg-primary mt-2 rounded-full" />
                </div>

                {activeTab === 'general' && renderGeneral()}
                {activeTab === 'localization' && renderLocalization()}
                {activeTab === 'permissions' && renderPermissions()}
                {activeTab === 'security' && renderSecurity()}
                {activeTab === 'system' && renderSystem()}
                {activeTab === 'templates' && renderTemplates()}
              </motion.div>
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-900 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
                >
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">Settings Synchronized Successfully</span>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
