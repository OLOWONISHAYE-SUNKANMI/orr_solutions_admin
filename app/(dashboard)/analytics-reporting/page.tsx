"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Download, Search, Loader } from "lucide-react";
import { analyticsAPI } from "@/app/services";

interface AnalyticsOverview {
  total_visitors: number;
  visitors_trend: number;
  page_views: number;
  page_views_trend: number;
  avg_session_duration: string;
  session_trend: number;
  traffic_sources: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  top_pages: Array<{
    title: string;
    views: number;
    avg_time: string;
  }>;
}

export default function AnalyticsReportingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "content">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getOverview() as AnalyticsOverview;
      setData(response);
    } catch (err: any) {
      console.warn("Analytics data fetch failed:", err);
      setError(err.message || "Failed to load analytics data");
      // Set mock/empty data structure to prevent crashes
      setData({
        total_visitors: 0,
        visitors_trend: 0,
        page_views: 0,
        page_views_trend: 0,
        avg_session_duration: "00:00:00",
        session_trend: 0,
        traffic_sources: [],
        top_pages: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await analyticsAPI.exportData("pdf");
      alert("Report exported successfully");
    } catch (err: any) {
      alert("Failed to export report: " + err.message);
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "traffic" as const, label: "Traffic" },
    { id: "content" as const, label: "Content" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-400 text-sm">{error} - Showing empty data</p>
                </div>
                <button 
                  onClick={fetchAnalytics}
                  className="bg-red-500/30 hover:bg-red-500/40 text-red-300 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white">Dashboard</h1>
                  <p className="text-gray-400 text-xs md:text-sm mt-2">Overview of your website&apos;s performance</p>
                </div>
                <button 
                  onClick={handleExport}
                  className="bg-primary hover:bg-primary/80 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm justify-center w-full md:w-auto"
                >
                  <Download size={16} className="md:w-[18px] md:h-[18px]" />
                  Export Report
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 text-sm"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 md:px-6 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-md"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Performance Summary */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Performance Summary</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-400 text-xs md:text-sm font-medium">Total Visitors</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl md:text-4xl font-bold text-white">{(data?.total_visitors || 0).toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+{data?.visitors_trend || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-400 text-xs md:text-sm font-medium">Page Views</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl md:text-4xl font-bold text-white">{(data?.page_views || 0).toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+{data?.page_views_trend || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-400 text-xs md:text-sm font-medium">Average Session Duration</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl md:text-4xl font-bold text-white">{data?.avg_session_duration || "00:00:00"}</p>
                          <div className="flex items-center gap-1 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+{data?.session_trend || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Traffic Tab Content */}
            {activeTab === "traffic" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl md:text-2xl font-semibold text-white">Traffic Sources</h2>
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-4 md:p-6">
                  <div className="space-y-4">
                    {(data?.traffic_sources || []).map((source) => (
                      <div key={source.name} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm md:text-base font-medium">{source.name}</span>
                          <span className="text-gray-400 text-sm">{source.percentage}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 md:h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${source.percentage}%`,
                              backgroundColor: source.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl md:text-2xl font-semibold text-white">Top Pages</h2>
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-white/10 border-b border-white/10">
                        <tr>
                          <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-300">Page Title</th>
                          <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-300">Views</th>
                          <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-300">Avg. Time on Page</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.top_pages || []).map((page, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150">
                            <td className="p-3 md:p-4">
                              <span className="text-white text-sm md:text-base font-medium">{page.title}</span>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="text-gray-300 text-sm md:text-base">{page.views.toLocaleString()}</span>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="text-gray-300 text-sm md:text-base">{page.avg_time}</span>
                            </td>
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
    </div>
  );
}
                  