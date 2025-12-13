"use client";

import { useState, useEffect } from "react";
import { BarChart3, Calendar, TrendingUp, Clock, Users, CheckCircle, Star } from "lucide-react";

interface ConsultationData {
  meeting_statistics: {
    total_meetings: number;
    meetings_this_month: number;
    completed_meetings: number;
    meeting_types_distribution: Record<string, number>;
    avg_meeting_duration: number;
    meeting_completion_rate: number;
  };
  conversion_metrics: {
    inquiry_to_meeting_rate: number;
    meeting_to_engagement_rate: number;
    repeat_consultation_rate: number;
    escalation_to_consultation_rate: number;
  };
  satisfaction_indicators: {
    meeting_feedback_score: number;
    follow_up_meeting_requests: number;
    client_retention_post_meeting: number;
    no_show_rate: number;
  };
  consultant_performance: Array<{
    consultant_name: string;
    meetings_hosted: number;
    completion_rate: number;
    avg_rating: number;
    client_satisfaction: number;
  }>;
}

interface SchedulingData {
  scheduling_patterns: {
    peak_request_hours: Record<string, number>;
    peak_request_days: Record<string, number>;
    avg_lead_time: number;
    rescheduling_rate: number;
  };
  availability_analysis: {
    consultant_utilization: Array<{
      consultant: string;
      meetings_this_month: number;
      utilization_rate: number;
    }>;
    time_slot_popularity: Record<string, number>;
    capacity_vs_demand: {
      current_capacity: number;
      current_demand: number;
      utilization_rate: number;
      capacity_gap: number;
    };
  };
  optimization_opportunities: {
    underutilized_slots: Array<{
      time: string;
      utilization: number;
    }>;
    high_demand_periods: Array<{
      period: string;
      demand_score: number;
    }>;
    suggested_capacity_adjustments: Array<{
      suggestion: string;
      impact: string;
    }>;
  };
}

export default function ConsultationMetricsPage() {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [schedulingData, setSchedulingData] = useState<SchedulingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultationRes, schedulingRes] = await Promise.all([
          fetch('http://127.0.0.1:8002/admin-portal/v1/consultation-metrics/performance/'),
          fetch('http://127.0.0.1:8002/admin-portal/v1/consultation-metrics/scheduling-analytics/')
        ]);
        
        if (consultationRes.ok && schedulingRes.ok) {
          const consultation = await consultationRes.json();
          const scheduling = await schedulingRes.json();
          setConsultationData(consultation);
          setSchedulingData(scheduling);
        } else {
          console.error('API Error:', consultationRes.status, schedulingRes.status);
        }
      } catch (error) {
        console.error('Error fetching consultation metrics:', error);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Consultation Metrics</h1>
            <p className="text-gray-400">Consultation performance and outcomes</p>
          </div>

          {/* Meeting Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Meeting Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Calendar className="text-blue-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Total Meetings</h3>
                <p className="text-2xl font-bold text-blue-400">{consultationData?.meeting_statistics?.total_meetings || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <TrendingUp className="text-green-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">This Month</h3>
                <p className="text-2xl font-bold text-green-400">{consultationData?.meeting_statistics?.meetings_this_month || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <CheckCircle className="text-purple-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Completed</h3>
                <p className="text-2xl font-bold text-purple-400">{consultationData?.meeting_statistics?.completed_meetings || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Clock className="text-orange-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Avg Duration</h3>
                <p className="text-2xl font-bold text-orange-400">{consultationData?.meeting_statistics?.avg_meeting_duration || 0} min</p>
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Conversion Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Inquiry to Meeting</h3>
                <p className="text-2xl font-bold text-cyan-400">{consultationData?.conversion_metrics?.inquiry_to_meeting_rate || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Meeting to Engagement</h3>
                <p className="text-2xl font-bold text-pink-400">{consultationData?.conversion_metrics?.meeting_to_engagement_rate || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Repeat Consultation</h3>
                <p className="text-2xl font-bold text-yellow-400">{consultationData?.conversion_metrics?.repeat_consultation_rate || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Escalation Rate</h3>
                <p className="text-2xl font-bold text-red-400">{consultationData?.conversion_metrics?.escalation_to_consultation_rate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Satisfaction Indicators */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Satisfaction Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Star className="text-yellow-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Feedback Score</h3>
                <p className="text-2xl font-bold text-yellow-400">{consultationData?.satisfaction_indicators?.meeting_feedback_score || 0}/5</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Calendar className="text-blue-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Follow-up Requests</h3>
                <p className="text-2xl font-bold text-blue-400">{consultationData?.satisfaction_indicators?.follow_up_meeting_requests || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Users className="text-green-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Client Retention</h3>
                <p className="text-2xl font-bold text-green-400">{consultationData?.satisfaction_indicators?.client_retention_post_meeting || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <TrendingUp className="text-red-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">No-show Rate</h3>
                <p className="text-2xl font-bold text-red-400">{consultationData?.satisfaction_indicators?.no_show_rate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Consultant Performance */}
          {consultationData?.consultant_performance && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Consultant Performance</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Consultant</th>
                        <th className="text-left text-white py-3">Meetings</th>
                        <th className="text-left text-white py-3">Completion Rate</th>
                        <th className="text-left text-white py-3">Avg Rating</th>
                        <th className="text-left text-white py-3">Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultationData.consultant_performance.map((consultant, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="text-gray-300 py-3">{consultant.consultant_name}</td>
                          <td className="text-blue-400 py-3">{consultant.meetings_hosted}</td>
                          <td className="text-green-400 py-3">{consultant.completion_rate}%</td>
                          <td className="text-yellow-400 py-3">{consultant.avg_rating}/5</td>
                          <td className="text-purple-400 py-3">{consultant.client_satisfaction}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Scheduling Analytics */}
          {schedulingData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Scheduling Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Peak Request Days</h3>
                  <div className="space-y-2">
                    {schedulingData?.scheduling_patterns?.peak_request_days && Object.entries(schedulingData.scheduling_patterns.peak_request_days).map(([day, percentage]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{day}</span>
                        <span className="text-blue-400">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Capacity vs Demand</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Capacity</span>
                      <span className="text-green-400">{schedulingData?.availability_analysis?.capacity_vs_demand?.current_capacity || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Demand</span>
                      <span className="text-blue-400">{schedulingData?.availability_analysis?.capacity_vs_demand?.current_demand || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Utilization Rate</span>
                      <span className="text-purple-400">{schedulingData?.availability_analysis?.capacity_vs_demand?.utilization_rate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Opportunities */}
          {schedulingData?.optimization_opportunities && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Optimization Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Underutilized Slots</h3>
                  <div className="space-y-2">
                    {schedulingData?.optimization_opportunities?.underutilized_slots?.map((slot, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">{slot.time}</span>
                        <span className="text-red-400">{slot.utilization}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Suggested Improvements</h3>
                  <div className="space-y-3">
                    {schedulingData?.optimization_opportunities?.suggested_capacity_adjustments?.map((suggestion, index) => (
                      <div key={index} className="">
                        <p className="text-white text-sm">{suggestion.suggestion}</p>
                        <p className="text-gray-400 text-xs">{suggestion.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
