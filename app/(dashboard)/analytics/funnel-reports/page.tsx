"use client";

import { useState, useEffect } from "react";
import { TrendingDown, Users, ArrowRight, AlertTriangle, Target, Clock } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

interface ConversionFunnelData {
  main_funnel: {
    stages: Array<{
      stage: string;
      count: number;
      conversion_rate: number;
    }>;
    overall_conversion_rate: number;
  };
  engagement_funnel: {
    ai_chat_funnel: {
      total_clients: number;
      tried_ai_chat: number;
      multiple_ai_sessions: number;
      conversion_rates: {
        trial_rate: number;
        retention_rate: number;
      };
    };
    meeting_funnel: {
      total_clients: number;
      requested_meeting: number;
      completed_meeting: number;
      conversion_rates: {
        request_rate: number;
        completion_rate: number;
      };
    };
    support_funnel: {
      total_clients: number;
      created_ticket: number;
      resolved_ticket: number;
      conversion_rates: {
        creation_rate: number;
        resolution_rate: number;
      };
    };
  };
  success_funnel: {
    milestones: Array<{
      milestone: string;
      count: number;
      percentage: number;
    }>;
  };
  dropoff_analysis: {
    dropoff_points: Array<{
      stage: string;
      dropoff_count: number;
      dropoff_rate: number;
      potential_reasons: string[];
    }>;
  };

}

interface TimeFunnelData {
  monthly_funnel: Array<{
    month: string;
    contacts: number;
    registrations: number;
    onboarding_completed: number;
    first_engagements: number;
    contact_to_registration_rate: number;
    registration_to_engagement_rate: number;
  }>;
  cohort_analysis: Array<{
    cohort_month: string;
    total_users: number;
    retention_data: Array<{
      month: number;
      retention_rate: number;
    }>;
  }>;
}

export default function FunnelReportsPage() {
  const { t } = useLanguageStore();
  const [conversionData, setConversionData] = useState<ConversionFunnelData | null>(null);
  const [timeData, setTimeData] = useState<TimeFunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

        const [conversionRes, timeRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/funnel-reports/conversion-funnel/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/funnel-reports/time-based-funnel/`, { headers })
        ]);
        
        if (conversionRes.ok && timeRes.ok) {
          const conversion = await conversionRes.json();
          const time = await timeRes.json();
          setConversionData(conversion.data || conversion);
          setTimeData(time.data || time);
        } else {
          console.error('API Error:', conversionRes.status, timeRes.status);
        }
      } catch (error) {
        console.error('Error fetching funnel reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('sidebar.funnel_reports')}</h1>
            <p className="text-gray-400">{t('analytics.user_journey_funnel')}</p>
          </div>

          {/* Main Conversion Funnel */}
          {conversionData?.main_funnel && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('analytics.main_conversion_funnel')}</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex flex-col space-y-4">
                  {conversionData.main_funnel.stages.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' :
                          index === 4 ? 'bg-cyan-500' : 'bg-pink-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{stage.stage}</h3>
                          <p className="text-gray-400 text-sm">{stage.conversion_rate}{t('analytics.conversion_label')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{stage.count}</p>
                        {index < conversionData.main_funnel.stages.length - 1 && (
                          <ArrowRight className="text-gray-400 mt-2" size={16} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{t('analytics.overall_conversion_rate')}</span>
                    <span className="text-2xl font-bold text-green-400">{conversionData.main_funnel.overall_conversion_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Engagement Funnels */}
          {conversionData?.engagement_funnel && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('analytics.feature_engagement_funnels')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">{t('analytics.ai_chat_funnel')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('analytics.total_clients')}</span>
                      <span className="text-white">{conversionData.engagement_funnel.ai_chat_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('analytics.ai_chat')}</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.ai_chat_funnel.tried_ai_chat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('analytics.multi_feature_users')}</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.ai_chat_funnel.multiple_ai_sessions}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.trial_rate')}</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.ai_chat_funnel.conversion_rates.trial_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.retention_rate')}</span>
                        <span className="text-orange-400">{conversionData.engagement_funnel.ai_chat_funnel.conversion_rates.retention_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">{t('analytics.meeting_funnel')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('analytics.total_clients')}</span>
                      <span className="text-white">{conversionData.engagement_funnel.meeting_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('meetings.pending_meetings')}</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.meeting_funnel.requested_meeting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('meetings.past_meetings')}</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.meeting_funnel.completed_meeting}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.request_rate')}</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.meeting_funnel.conversion_rates.request_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.completion_rate')}</span>
                        <span className="text-orange-400">{conversionData.engagement_funnel.meeting_funnel.conversion_rates.completion_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">{t('analytics.support_funnel')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('analytics.total_clients')}</span>
                      <span className="text-white">{conversionData.engagement_funnel.support_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('tickets.create_button')}</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.support_funnel.created_ticket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('tickets.resolved')}</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.support_funnel.resolved_ticket}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.creation_rate')}</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.support_funnel.conversion_rates.creation_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('analytics.resolution_rate')}</span>
                        <span className="text-orange-400">{conversionData.engagement_funnel.support_funnel.conversion_rates.resolution_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drop-off Analysis */}
          {conversionData?.dropoff_analysis && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{t('analytics.dropoff_analysis')}</h2>
              <div className="space-y-4">
                {conversionData.dropoff_analysis.dropoff_points.map((point, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="text-red-400" size={24} />
                        <div>
                          <h3 className="text-lg font-medium text-white">{point.stage}</h3>
                          <p className="text-red-400">{point.dropoff_rate}% {t('analytics.dropoff_rate')} ({point.dropoff_count} {t('analytics.users_label')})</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{t('analytics.optimization_opportunities')}:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {point.potential_reasons.map((reason, idx) => (
                          <li key={idx} className="text-gray-300 text-sm">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}




        </div>
      </div>
    </div>
  );
}
