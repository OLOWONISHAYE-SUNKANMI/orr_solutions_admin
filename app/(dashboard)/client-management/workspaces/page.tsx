"use client";

import { useEffect, useState } from "react";
import { Briefcase, Users, Bot, Calendar, FileText, Loader, Activity, Settings, RefreshCcw, TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { analyticsAPI } from "@/app/services";

export default function ClientWorkspacesPage() {
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getWorkspaceUsage() as any;
      setData(res?.data || res);
    } catch (err: any) {
      console.error("Failed to fetch workspace analytics:", err);
      setError(err.message || "Failed to load workspace analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
          <Loader className="animate-spin text-primary" size={48} />
        </div>
      </div>
    );
  }

  const featureUsage = data?.feature_usage || {};
  const efficiency = data?.efficiency_metrics || {};
  const activity = data?.activity_patterns || {};

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('clients.workspaces_title')}</h1>
              <p className="text-gray-400">Workspace adoption and engagement analytics</p>
            </div>
            <button 
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
              <Users size={24} className="text-blue-400 mb-4" />
              <p className="text-gray-400 text-sm mb-1">Active Users (30d)</p>
              <h3 className="text-3xl font-bold text-white">{featureUsage.total_active_users || 0}</h3>
            </div>
            
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
              <Bot size={24} className="text-purple-400 mb-4" />
              <p className="text-gray-400 text-sm mb-1">AI Chat Users</p>
              <h3 className="text-3xl font-bold text-white">{featureUsage.ai_chat_users || 0}</h3>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
              <Calendar size={24} className="text-green-400 mb-4" />
              <p className="text-gray-400 text-sm mb-1">Scheduler Users</p>
              <h3 className="text-3xl font-bold text-white">{featureUsage.meeting_scheduler_users || 0}</h3>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
              <FileText size={24} className="text-orange-400 mb-4" />
              <p className="text-gray-400 text-sm mb-1">Support Users</p>
              <h3 className="text-3xl font-bold text-white">{featureUsage.support_ticket_users || 0}</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Task Completion Rates
              </h3>
              <div className="space-y-4">
                {Object.entries(efficiency?.task_completion_rates || {}).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{Number(val).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
                {Object.keys(efficiency?.task_completion_rates || {}).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No completion data available</div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                User Satisfaction Indicators
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(efficiency?.user_satisfaction_indicators || {}).map(([key, val]) => (
                  <div key={key} className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-400 mb-1 capitalize truncate" title={key.replace(/_/g, ' ')}>{key.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-semibold text-white">
                      {typeof val === 'number' ? (key.includes('rate') ? `${val}%` : val.toFixed(1)) : String(val)}
                    </p>
                  </div>
                ))}
                {Object.keys(efficiency?.user_satisfaction_indicators || {}).length === 0 && (
                  <div className="col-span-2 text-center py-4 text-gray-500">No satisfaction data available</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
