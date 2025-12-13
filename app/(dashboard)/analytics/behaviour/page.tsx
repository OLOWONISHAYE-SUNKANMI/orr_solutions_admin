"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, MousePointer, Clock, Activity, BarChart3 } from "lucide-react";

interface BehaviorData {
  login_patterns: {
    daily_active_users: number;
    weekly_active_users: number;
    peak_hours: Record<string, number>;
    login_frequency: Record<string, number>;
  };
  feature_usage: {
    ai_chat_usage: number;
    meeting_requests: number;
    ticket_submissions: number;
    document_downloads: number;
  };
  engagement_metrics: {
    session_duration: number;
    bounce_rate: number;
    return_user_rate: number;
    feature_adoption: Record<string, number>;
  };
}

interface JourneyData {
  onboarding_funnel: {
    registered_users: number;
    started_onboarding: number;
    completed_onboarding: number;
    first_meeting_scheduled: number;
    active_users: number;
  };
  engagement_milestones: {
    first_ai_interaction: number;
    first_ticket_created: number;
    multiple_meetings: number;
    document_engagement: number;
  };
  dropoff_analysis: Record<string, number>;
}

export default function BehaviourAnalyticsPage() {
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [behaviorRes, journeyRes] = await Promise.all([
          fetch('http://127.0.0.1:8002/admin-portal/v1/behavior-analytics/user-behavior/'),
          fetch('http://127.0.0.1:8002/admin-portal/v1/behavior-analytics/user-journey/')
        ]);
        
        if (behaviorRes.ok && journeyRes.ok) {
          const behavior = await behaviorRes.json();
          const journey = await journeyRes.json();
          setBehaviorData(behavior);
          setJourneyData(journey);
        } else {
          console.error('API Error:', behaviorRes.status, journeyRes.status);
        }
      } catch (error) {
        console.error('Error fetching behavior analytics:', error);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Behaviour Analytics</h1>
            <p className="text-gray-400">User behavior and engagement patterns</p>
          </div>

          {/* Login Patterns */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Login Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Users className="text-blue-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Daily Active</h3>
                <p className="text-2xl font-bold text-blue-400">{behaviorData?.login_patterns?.daily_active_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Users className="text-green-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Weekly Active</h3>
                <p className="text-2xl font-bold text-green-400">{behaviorData?.login_patterns?.weekly_active_users || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Clock className="text-purple-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Peak Hours</h3>
                <p className="text-sm text-gray-400">Afternoon: {behaviorData?.login_patterns?.peak_hours?.afternoon || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <TrendingUp className="text-orange-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Return Rate</h3>
                <p className="text-2xl font-bold text-orange-400">{behaviorData?.engagement_metrics?.return_user_rate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Feature Usage */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Feature Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <MousePointer className="text-cyan-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">AI Chat</h3>
                <p className="text-2xl font-bold text-cyan-400">{behaviorData?.feature_usage?.ai_chat_usage || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Activity className="text-pink-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Meetings</h3>
                <p className="text-2xl font-bold text-pink-400">{behaviorData?.feature_usage?.meeting_requests || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <BarChart3 className="text-yellow-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Tickets</h3>
                <p className="text-2xl font-bold text-yellow-400">{behaviorData?.feature_usage?.ticket_submissions || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <TrendingUp className="text-red-400 mb-2" size={24} />
                <h3 className="text-lg font-medium text-white">Downloads</h3>
                <p className="text-2xl font-bold text-red-400">{behaviorData?.feature_usage?.document_downloads || 0}</p>
              </div>
            </div>
          </div>

          {/* User Journey Funnel */}
          {journeyData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">User Journey Funnel</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Registered Users</span>
                    <span className="text-blue-400 font-bold">{journeyData?.onboarding_funnel?.registered_users || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Started Onboarding</span>
                    <span className="text-green-400 font-bold">{journeyData?.onboarding_funnel?.started_onboarding || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Completed Onboarding</span>
                    <span className="text-purple-400 font-bold">{journeyData?.onboarding_funnel?.completed_onboarding || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">First Meeting Scheduled</span>
                    <span className="text-orange-400 font-bold">{journeyData?.onboarding_funnel?.first_meeting_scheduled || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Active Users</span>
                    <span className="text-cyan-400 font-bold">{journeyData?.onboarding_funnel?.active_users || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Metrics */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Engagement Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Session Duration</h3>
                <p className="text-2xl font-bold text-blue-400">{behaviorData?.engagement_metrics?.session_duration || 0} min</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Bounce Rate</h3>
                <p className="text-2xl font-bold text-red-400">{behaviorData?.engagement_metrics?.bounce_rate || 0}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Feature Adoption</h3>
                <div className="space-y-2">
                  {behaviorData?.engagement_metrics?.feature_adoption && Object.entries(behaviorData.engagement_metrics.feature_adoption).map(([feature, rate]) => (
                    <div key={feature} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{feature.replace('_', ' ')}</span>
                      <span className="text-white">{rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
