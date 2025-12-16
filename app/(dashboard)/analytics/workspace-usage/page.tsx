"use client";

import { useState, useEffect } from "react";
import { Activity, Users, FileText, MessageSquare, Calendar, TrendingUp, Clock } from "lucide-react";

interface WorkspaceData {
  feature_usage: {
    total_active_users: number;
    ai_chat_users: number;
    meeting_scheduler_users: number;
    support_ticket_users: number;
    document_users: number;
  };

  activity_patterns: {
    daily_active_users: Array<{
      date: string;
      active_users: number;
    }>;
    peak_usage_hours: Record<string, number>;
    feature_adoption_timeline: Array<{
      month: string;
      ai_chat_users: number;
      meeting_users: number;
      ticket_users: number;
    }>;
    user_journey_patterns: {
      onboarding_to_ai: number;
      ai_to_meeting: number;
      meeting_to_ticket: number;
      content_to_meeting: number;
    };
  };
  efficiency_metrics: {
    task_completion_rates: {
      onboarding_completion: number;
      meeting_completion: number;
      ticket_resolution: number;
    };
    user_satisfaction_indicators: {
      return_user_rate: number;
      feature_usage_diversity: number;
      session_length_trend: string;
      user_feedback_score: number;
    };
    feature_abandonment_rates: {
      ai_chat_abandonment: number;
      meeting_booking_abandonment: number;
      onboarding_abandonment: number;
      content_browsing_abandonment: number;
    };
    help_seeking_behavior: {
      support_ticket_rate: number;
      ai_chat_usage_rate: number;
      meeting_request_rate: number;
      self_service_rate: number;
    };
  };
}

interface FeatureAdoptionData {
  adoption_funnel: {
    registered_users: number;
    activated_users: number;
    onboarding_started: number;
    onboarding_completed: number;
    first_feature_used: number;
    multi_feature_users: number;
  };
  utilization_depth: {
    ai_chat: {
      light_users: number;
      moderate_users: number;
      heavy_users: number;
    };
    meetings: {
      single_meeting: number;
      multiple_meetings: number;
    };
    support_tickets: {
      occasional_users: number;
      regular_users: number;
    };
  };
  onboarding_metrics: {
    onboarding_start_rate: number;
    onboarding_completion_rate: number;
    time_to_first_feature: number;
    feature_discovery_rate: number;
    onboarding_drop_off_points: Array<{
      step: string;
      drop_off_rate: number;
    }>;
  };
  feature_stickiness: {
    ai_chat_retention: number;
    meeting_retention: number;
    ticket_retention: number;
    overall_platform_retention: number;
  };
}

export default function WorkspaceUsagePage() {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [adoptionData, setAdoptionData] = useState<FeatureAdoptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workspaceRes, adoptionRes] = await Promise.all([
          fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/workspace-usage/analytics/'),
          fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/workspace-usage/feature-adoption/')
        ]);
        
        if (workspaceRes.ok && adoptionRes.ok) {
          const workspace = await workspaceRes.json();
          const adoption = await adoptionRes.json();
          setWorkspaceData(workspace.data || workspace);
          setAdoptionData(adoption.data || adoption);
        } else {
          console.error('API Error:', workspaceRes.status, adoptionRes.status);
        }
      } catch (error) {
        console.error('Error fetching workspace usage:', error);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Workspace Usage</h1>
            <p className="text-gray-400">Client workspace activity and engagement analytics</p>
          </div>

          {/* Feature Usage Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Feature Usage Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Users className="text-blue-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Active Users</h3>
                <p className="text-2xl font-bold text-blue-400">{workspaceData?.feature_usage.total_active_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <MessageSquare className="text-green-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">AI Chat Users</h3>
                <p className="text-2xl font-bold text-green-400">{workspaceData?.feature_usage.ai_chat_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Calendar className="text-purple-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Meeting Users</h3>
                <p className="text-2xl font-bold text-purple-400">{workspaceData?.feature_usage.meeting_scheduler_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Activity className="text-orange-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Ticket Users</h3>
                <p className="text-2xl font-bold text-orange-400">{workspaceData?.feature_usage.support_ticket_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <FileText className="text-cyan-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Document Users</h3>
                <p className="text-2xl font-bold text-cyan-400">{workspaceData?.feature_usage.document_users || 0}</p>
              </div>
            </div>
          </div>



          {/* Adoption Funnel */}
          {adoptionData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Feature Adoption Funnel</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{adoptionData.adoption_funnel.registered_users}</p>
                    <p className="text-gray-400 text-sm">Registered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{adoptionData.adoption_funnel.activated_users}</p>
                    <p className="text-gray-400 text-sm">Activated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{adoptionData.adoption_funnel.onboarding_started}</p>
                    <p className="text-gray-400 text-sm">Started Onboarding</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{adoptionData.adoption_funnel.onboarding_completed}</p>
                    <p className="text-gray-400 text-sm">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">{adoptionData.adoption_funnel.first_feature_used}</p>
                    <p className="text-gray-400 text-sm">First Feature</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-400">{adoptionData.adoption_funnel.multi_feature_users}</p>
                    <p className="text-gray-400 text-sm">Multi-Feature</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Completion Rates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Task Completion Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Onboarding</h3>
                <p className="text-2xl font-bold text-blue-400">{workspaceData?.efficiency_metrics.task_completion_rates.onboarding_completion.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Meeting Completion</h3>
                <p className="text-2xl font-bold text-green-400">{workspaceData?.efficiency_metrics.task_completion_rates.meeting_completion.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Ticket Resolution</h3>
                <p className="text-2xl font-bold text-purple-400">{workspaceData?.efficiency_metrics.task_completion_rates.ticket_resolution.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>

          {/* User Journey Patterns */}
          {workspaceData?.activity_patterns.user_journey_patterns && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">User Journey Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Onboarding → AI</h3>
                  <p className="text-2xl font-bold text-cyan-400">{workspaceData.activity_patterns.user_journey_patterns.onboarding_to_ai}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">AI → Meeting</h3>
                  <p className="text-2xl font-bold text-pink-400">{workspaceData.activity_patterns.user_journey_patterns.ai_to_meeting}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Meeting → Ticket</h3>
                  <p className="text-2xl font-bold text-yellow-400">{workspaceData.activity_patterns.user_journey_patterns.meeting_to_ticket}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Content → Meeting</h3>
                  <p className="text-2xl font-bold text-red-400">{workspaceData.activity_patterns.user_journey_patterns.content_to_meeting}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Stickiness */}
          {adoptionData?.feature_stickiness && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Feature Retention Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">AI Chat</h3>
                  <p className="text-2xl font-bold text-blue-400">{adoptionData.feature_stickiness.ai_chat_retention}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Meetings</h3>
                  <p className="text-2xl font-bold text-green-400">{adoptionData.feature_stickiness.meeting_retention}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Tickets</h3>
                  <p className="text-2xl font-bold text-purple-400">{adoptionData.feature_stickiness.ticket_retention}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Overall Platform</h3>
                  <p className="text-2xl font-bold text-orange-400">{adoptionData.feature_stickiness.overall_platform_retention}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
