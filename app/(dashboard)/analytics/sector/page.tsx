"use client";

import { useState, useEffect } from "react";
import { Building2, TrendingUp, Users, BarChart3, PieChart } from "lucide-react";

interface SectorData {
  sector_distribution: Record<string, number>;
  stage_distribution: Record<string, number>;
  pillar_preferences: Record<string, Record<string, number>>;
  engagement_metrics: Record<string, {
    avg_meetings: number;
    avg_tickets: number;
    completion_rate: number;
  }>;
  success_metrics: Record<string, {
    meeting_completion_rate: number;
    ticket_resolution_rate: number;
    retention_rate: number;
  }>;
}

interface BenchmarkData {
  industry_averages: {
    avg_onboarding_time: number;
    avg_first_meeting_time: number;
    avg_ticket_resolution: number;
    avg_engagement_score: number;
  };
  sector_performance: Record<string, {
    engagement_score: number;
    satisfaction_score: number;
    retention_rate: number;
  }>;
  growth_trends: Record<string, Array<{
    month: string;
    count: number;
  }>>;
}

export default function SectorInsightsPage() {
  const [sectorData, setSectorData] = useState<SectorData | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectorRes, benchmarkRes] = await Promise.all([
          fetch('http://127.0.0.1:8002/admin-portal/v1/sector-insights/sector-analytics/'),
          fetch('http://127.0.0.1:8002/admin-portal/v1/sector-insights/industry-benchmarks/')
        ]);
        
        if (sectorRes.ok && benchmarkRes.ok) {
          const sector = await sectorRes.json();
          const benchmark = await benchmarkRes.json();
          setSectorData(sector.data || sector);
          setBenchmarkData(benchmark.data || benchmark);
        } else {
          console.error('API Error:', sectorRes.status, benchmarkRes.status);
        }
      } catch (error) {
        console.error('Error fetching sector insights:', error);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 rounded-xl"></div>
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Sector Insights</h1>
            <p className="text-gray-400">Industry and sector-specific analytics</p>
          </div>

          {/* Sector Distribution */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Client Distribution by Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectorData?.sector_distribution && Object.keys(sectorData.sector_distribution).length > 0 ? (
                Object.entries(sectorData.sector_distribution).map(([sector, count]) => (
                  <div key={sector} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <Building2 className="text-blue-400 mb-2" size={24} />
                    <h3 className="text-lg font-medium text-white capitalize">{sector.replace('_', ' ')}</h3>
                    <p className="text-2xl font-bold text-blue-400">{count}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <Building2 className="text-gray-400 mb-4 mx-auto" size={48} />
                  <h3 className="text-lg font-medium text-white mb-2">No Sector Data Available</h3>
                  <p className="text-gray-400">Client sector distribution will appear here once onboarding data is collected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Stage Distribution */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Project Stage Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {sectorData?.stage_distribution && Object.keys(sectorData.stage_distribution).length > 0 ? (
                Object.entries(sectorData.stage_distribution).map(([stage, count]) => (
                  <div key={stage} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <PieChart className="text-green-400 mb-2" size={20} />
                    <h3 className="text-sm font-medium text-white capitalize">{stage.replace('_', ' ')}</h3>
                    <p className="text-xl font-bold text-green-400">{count}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <PieChart className="text-gray-400 mb-4 mx-auto" size={48} />
                  <h3 className="text-lg font-medium text-white mb-2">No Stage Data Available</h3>
                  <p className="text-gray-400">Project stage distribution will appear here once onboarding data is collected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Industry Averages */}
          {benchmarkData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Industry Benchmarks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <TrendingUp className="text-purple-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Avg Onboarding</h3>
                  <p className="text-2xl font-bold text-purple-400">{benchmarkData?.industry_averages?.avg_onboarding_time || 0} days</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Users className="text-orange-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">First Meeting</h3>
                  <p className="text-2xl font-bold text-orange-400">{benchmarkData?.industry_averages?.avg_first_meeting_time || 0} days</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <BarChart3 className="text-cyan-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Ticket Resolution</h3>
                  <p className="text-2xl font-bold text-cyan-400">{benchmarkData?.industry_averages?.avg_ticket_resolution || 0} days</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <TrendingUp className="text-pink-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Engagement Score</h3>
                  <p className="text-2xl font-bold text-pink-400">{benchmarkData?.industry_averages?.avg_engagement_score || 0}/10</p>
                </div>
              </div>
            </div>
          )}

          {/* Sector Performance Comparison */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Sector Performance Comparison</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              {benchmarkData?.sector_performance && Object.keys(benchmarkData.sector_performance).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Sector</th>
                        <th className="text-left text-white py-3">Engagement</th>
                        <th className="text-left text-white py-3">Satisfaction</th>
                        <th className="text-left text-white py-3">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(benchmarkData.sector_performance).map(([sector, metrics]) => (
                        <tr key={sector} className="border-b border-white/5">
                          <td className="text-gray-300 py-3 capitalize">{sector.replace('_', ' ')}</td>
                          <td className="text-blue-400 py-3">{metrics.engagement_score}/10</td>
                          <td className="text-green-400 py-3">{metrics.satisfaction_score}/10</td>
                          <td className="text-purple-400 py-3">{metrics.retention_rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="text-gray-400 mb-4 mx-auto" size={48} />
                  <h3 className="text-lg font-medium text-white mb-2">No Performance Data Available</h3>
                  <p className="text-gray-400">Sector performance comparison will appear here once client data is available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Engagement Metrics by Sector */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Engagement Metrics by Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectorData?.engagement_metrics && Object.keys(sectorData.engagement_metrics).length > 0 ? (
                Object.entries(sectorData.engagement_metrics).map(([sector, metrics]) => (
                  <div key={sector} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4 capitalize">{sector.replace('_', ' ')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Meetings</span>
                        <span className="text-blue-400 font-bold">{metrics.avg_meetings.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Tickets</span>
                        <span className="text-green-400 font-bold">{metrics.avg_tickets.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Completion Rate</span>
                        <span className="text-purple-400 font-bold">{metrics.completion_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                  <Users className="text-gray-400 mb-4 mx-auto" size={48} />
                  <h3 className="text-lg font-medium text-white mb-2">No Engagement Data Available</h3>
                  <p className="text-gray-400">Sector engagement metrics will appear here once client activity data is available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
