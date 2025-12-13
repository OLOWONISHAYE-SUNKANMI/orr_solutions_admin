"use client";

import { useState, useEffect } from "react";
import { TrendingDown, Users, ArrowRight, AlertTriangle, Target, Clock } from "lucide-react";

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
  conversion_by_source: Record<string, {
    visitors: number;
    registrations: number;
    active_clients: number;
    conversion_rate: number;
  }>;
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
  time_to_conversion: {
    registration_to_onboarding: {
      avg_days: number;
      median_days: number;
      percentiles: {
        "25th": number;
        "75th": number;
        "90th": number;
      };
    };
    onboarding_to_first_engagement: {
      avg_days: number;
      median_days: number;
      percentiles: {
        "25th": number;
        "75th": number;
        "90th": number;
      };
    };
    registration_to_first_meeting: {
      avg_days: number;
      median_days: number;
      percentiles: {
        "25th": number;
        "75th": number;
        "90th": number;
      };
    };
    first_contact_to_active_client: {
      avg_days: number;
      median_days: number;
      percentiles: {
        "25th": number;
        "75th": number;
        "90th": number;
      };
    };
  };
}

export default function FunnelReportsPage() {
  const [conversionData, setConversionData] = useState<ConversionFunnelData | null>(null);
  const [timeData, setTimeData] = useState<TimeFunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversionRes, timeRes] = await Promise.all([
          fetch('http://127.0.0.1:8002/admin-portal/v1/funnel-reports/conversion-funnel/'),
          fetch('http://127.0.0.1:8002/admin-portal/v1/funnel-reports/time-based-funnel/')
        ]);
        
        if (conversionRes.ok && timeRes.ok) {
          const conversion = await conversionRes.json();
          const time = await timeRes.json();
          setConversionData(conversion);
          setTimeData(time);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Funnel Reports</h1>
            <p className="text-gray-400">Client journey and conversion analytics</p>
          </div>

          {/* Main Conversion Funnel */}
          {conversionData?.main_funnel && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Main Conversion Funnel</h2>
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
                          <p className="text-gray-400 text-sm">{stage.conversion_rate}% conversion</p>
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
                    <span className="text-white font-medium">Overall Conversion Rate</span>
                    <span className="text-2xl font-bold text-green-400">{conversionData.main_funnel.overall_conversion_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Engagement Funnels */}
          {conversionData?.engagement_funnel && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Feature Engagement Funnels</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">AI Chat Funnel</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Clients</span>
                      <span className="text-white">{conversionData.engagement_funnel.ai_chat_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tried AI Chat</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.ai_chat_funnel.tried_ai_chat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Multiple Sessions</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.ai_chat_funnel.multiple_ai_sessions}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trial Rate</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.ai_chat_funnel.conversion_rates.trial_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Retention Rate</span>
                        <span className="text-orange-400">{conversionData.engagement_funnel.ai_chat_funnel.conversion_rates.retention_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Meeting Funnel</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Clients</span>
                      <span className="text-white">{conversionData.engagement_funnel.meeting_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requested Meeting</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.meeting_funnel.requested_meeting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed Meeting</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.meeting_funnel.completed_meeting}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Request Rate</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.meeting_funnel.conversion_rates.request_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Completion Rate</span>
                        <span className="text-orange-400">{conversionData.engagement_funnel.meeting_funnel.conversion_rates.completion_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Support Funnel</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Clients</span>
                      <span className="text-white">{conversionData.engagement_funnel.support_funnel.total_clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created Ticket</span>
                      <span className="text-blue-400">{conversionData.engagement_funnel.support_funnel.created_ticket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolved Ticket</span>
                      <span className="text-green-400">{conversionData.engagement_funnel.support_funnel.resolved_ticket}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Creation Rate</span>
                        <span className="text-purple-400">{conversionData.engagement_funnel.support_funnel.conversion_rates.creation_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Resolution Rate</span>
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
              <h2 className="text-xl font-semibold text-white mb-4">Drop-off Analysis</h2>
              <div className="space-y-4">
                {conversionData.dropoff_analysis.dropoff_points.map((point, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="text-red-400" size={24} />
                        <div>
                          <h3 className="text-lg font-medium text-white">{point.stage}</h3>
                          <p className="text-red-400">{point.dropoff_rate}% drop-off ({point.dropoff_count} users)</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Potential reasons:</p>
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

          {/* Time to Conversion */}
          {timeData?.time_to_conversion && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Time to Conversion Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Registration to Onboarding</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average</span>
                      <span className="text-blue-400">{timeData.time_to_conversion.registration_to_onboarding.avg_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Median</span>
                      <span className="text-green-400">{timeData.time_to_conversion.registration_to_onboarding.median_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">90th Percentile</span>
                      <span className="text-purple-400">{timeData.time_to_conversion.registration_to_onboarding.percentiles["90th"]} days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Onboarding to First Engagement</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average</span>
                      <span className="text-blue-400">{timeData.time_to_conversion.onboarding_to_first_engagement.avg_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Median</span>
                      <span className="text-green-400">{timeData.time_to_conversion.onboarding_to_first_engagement.median_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">90th Percentile</span>
                      <span className="text-purple-400">{timeData.time_to_conversion.onboarding_to_first_engagement.percentiles["90th"]} days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Registration to First Meeting</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average</span>
                      <span className="text-blue-400">{timeData.time_to_conversion.registration_to_first_meeting.avg_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Median</span>
                      <span className="text-green-400">{timeData.time_to_conversion.registration_to_first_meeting.median_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">90th Percentile</span>
                      <span className="text-purple-400">{timeData.time_to_conversion.registration_to_first_meeting.percentiles["90th"]} days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">First Contact to Active Client</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average</span>
                      <span className="text-blue-400">{timeData.time_to_conversion.first_contact_to_active_client.avg_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Median</span>
                      <span className="text-green-400">{timeData.time_to_conversion.first_contact_to_active_client.median_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">90th Percentile</span>
                      <span className="text-purple-400">{timeData.time_to_conversion.first_contact_to_active_client.percentiles["90th"]} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversion by Source */}
          {conversionData?.conversion_by_source && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Conversion by Traffic Source</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Source</th>
                        <th className="text-left text-white py-3">Visitors</th>
                        <th className="text-left text-white py-3">Registrations</th>
                        <th className="text-left text-white py-3">Active Clients</th>
                        <th className="text-left text-white py-3">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(conversionData.conversion_by_source).map(([source, data]) => (
                        <tr key={source} className="border-b border-white/5">
                          <td className="text-gray-300 py-3 capitalize">{source.replace('_', ' ')}</td>
                          <td className="text-blue-400 py-3">{data.visitors}</td>
                          <td className="text-green-400 py-3">{data.registrations}</td>
                          <td className="text-purple-400 py-3">{data.active_clients}</td>
                          <td className="text-orange-400 py-3">{data.conversion_rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
