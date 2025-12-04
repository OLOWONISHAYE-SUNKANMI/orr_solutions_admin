"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, AlertCircle, Calendar, MessageSquare, TrendingUp, Clock, Loader } from "lucide-react";
import { dashboardAPI, contentAPI } from "@/app/services";
import type { DashboardMetrics, ContentListItem } from "@/app/services/types";

// Sample data - will be replaced with API calls
const trafficData = [
  { day: "Mon", value: 2400 },
  { day: "Tue", value: 1398 },
  { day: "Wed", value: 9800 },
  { day: "Thu", value: 3908 },
  { day: "May", value: 4800 },
  { day: "Fri", value: 3800 },
  { day: "Sat", value: 4300 },
];

const engagementData = [
  { day: "Mon", value: 400 },
  { day: "Tue", value: 300 },
  { day: "Wed", value: 200 },
  { day: "Thu", value: 278 },
  { day: "Fri", value: 189 },
  { day: "Sat", value: 239 },
  { day: "Sun", value: 349 },
];

function page() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentContent, setRecentContent] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardMetrics = await dashboardAPI.getOverview() as DashboardMetrics;
        const contentResponse = await contentAPI.listContent({ limit: 5 }) as any;
        setMetrics(dashboardMetrics);
        // Handle both array response and object with results
        setRecentContent(Array.isArray(contentResponse) ? contentResponse : (contentResponse.results || []));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">Welcome back! Here's your overview</p>
            </div>

            {/* Key Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/30 w-12 h-12 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Active Clients</p>
                      <p className="text-2xl font-bold text-white mt-1">{metrics.active_clients}</p>
                      <p className="text-primary text-xs mt-1">Portal active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-6 border border-orange-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Pending Tickets</p>
                      <p className="text-2xl font-bold text-white mt-1">{metrics.pending_tickets}</p>
                      <p className="text-orange-400 text-xs mt-1">Awaiting action</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Upcoming Meetings</p>
                      <p className="text-2xl font-bold text-white mt-1">{metrics.upcoming_meetings}</p>
                      <p className="text-blue-400 text-xs mt-1">Next 7 days</p>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">AI Chat Sessions</p>
                      <p className="text-2xl font-bold text-white mt-1">{metrics.ai_chat_sessions}</p>
                      <p className="text-purple-400 text-xs mt-1">{metrics.escalation_rate}% escalated</p>
                    </div>
                  </div>
                </div> */}
              </div>
            )}

            {/* <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex items-center gap-3">
                <button className="text-white bg-white/20 hover:bg-white/30 p-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Create Post
                </button>
                <button className="text-white bg-primary hover:bg-primary/80 p-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Upload Media
                </button>
              </div>
            </div> */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Recent Content</h2>
              <div className="overflow-x-auto border border-primary/30 rounded-xl shadow-lg bg-gradient-to-br from-white/15 to-white/5">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-primary/30 bg-white/5">
                  <tr>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base">Title</th>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base">Type</th>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base">Status</th>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base hidden sm:table-cell">Author</th>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base hidden lg:table-cell">Views</th>
                    <th className="text-left p-2 md:p-4 text-primary font-semibold text-sm md:text-base hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContent.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/10 transition-colors duration-200">
                      <td className="py-2 md:py-4 px-2 md:px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium line-clamp-1 text-sm md:text-base">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4">
                        <span className="text-gray-300 text-xs md:text-sm capitalize">{item.content_type}</span>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4">
                        <div className={`w-fit px-2 md:px-3 py-1 md:py-2 rounded-lg font-medium text-xs md:text-sm capitalize ${
                          item.status === "published" 
                            ? "bg-primary/30 text-primary border border-primary/30" 
                            : item.status === "draft"
                            ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                            : "bg-gray-500/30 text-gray-300 border border-gray-500/30"
                        }`}>
                          {item.status}
                        </div>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4 text-gray-300 hidden sm:table-cell">
                        <span className="text-xs md:text-sm">{item.author_name}</span>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4 text-gray-300 hidden lg:table-cell">
                        <span className="text-xs md:text-sm">{item.view_count}</span>
                      </td>
                      <td className="py-2 md:py-4 px-2 md:px-4 text-gray-400 hidden md:table-cell">
                        <span className="text-xs md:text-sm">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Analytics Overview
            </h2>
            <div className="flex flex-col lg:flex-row items-stretch gap-4 md:gap-6">
              <div className="border border-primary/30 lg:basis-1/2 p-4 md:p-6 rounded-xl flex flex-col gap-4 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base md:text-lg text-white font-semibold">Website Traffic</p>
                    <p className="text-2xl md:text-3xl font-bold text-white mt-2">12,345</p>
                    <p className="text-primary text-xs md:text-sm mt-1">Last 7 Days +5%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #0ec277",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0ec277"
                      strokeWidth={2}
                      dot={{ fill: "#0ec277", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="border border-primary/30 basis-1/2 p-6 rounded-xl flex flex-col gap-4 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg text-white font-semibold">User Engagement</p>
                    <p className="text-3xl font-bold text-white mt-2">4,567</p>
                    <p className="text-primary text-sm mt-1">Last 30 Days -2%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#ffffff60" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #0ec277",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#0ec277" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
