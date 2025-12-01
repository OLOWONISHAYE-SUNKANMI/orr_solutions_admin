"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Loader, Download } from "lucide-react";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { analyticsAPI } from "@/app/services";

export default function AnalyticsPage() {
  const [clientAnalytics, setClientAnalytics] = useState<any>(null);
  const [contentAnalytics, setContentAnalytics] = useState<any>(null);
  const [overviewAnalytics, setOverviewAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [client, content, overview] = await Promise.all([
          analyticsAPI.getClientAnalytics(),
          analyticsAPI.getContentAnalytics(),
          analyticsAPI.getOverview(),
        ]);
        setClientAnalytics(client);
        setContentAnalytics(content);
        setOverviewAnalytics(overview);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    try {
      await analyticsAPI.exportData(exportFormat);
    } catch (err) {
      console.error("Failed to export analytics:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }
  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-8 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Analytics & Reporting
            </h1>
            <p className="text-gray-400 text-sm">Track your performance metrics and analytics</p>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <div className="flex gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "csv" | "pdf")}
              className="bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="csv" className="bg-gray-800">CSV</option>
              <option value="pdf" className="bg-gray-800">PDF</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col basis-[70%] gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm rounded-xl p-6 w-full border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <ArrowUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-3xl text-white">78,987</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-sm">Visitors</p>
                      <p className="text-primary text-sm font-semibold">+16.4%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 backdrop-blur-sm rounded-xl p-6 w-full border border-red-500/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <ArrowDown className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-3xl text-white">23,000.00</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-sm">Followers</p>
                      <p className="text-primary text-sm font-semibold">+16.4%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-6 w-full border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-white/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <ArrowDown className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-3xl text-white">28,670</p>
                    <p className="text-gray-400 text-sm mt-1">Sales</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl p-6 min-h-[30vh] flex flex-col border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Content Analytics</h2>
              </div>
              {contentAnalytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Content</p>
                      <p className="text-2xl font-bold text-white">{contentAnalytics.total_content || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Views</p>
                      <p className="text-2xl font-bold text-white">{contentAnalytics.total_views || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Total Downloads</p>
                      <p className="text-2xl font-bold text-white">{contentAnalytics.total_downloads || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No content analytics available</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Client Analytics</h3>
              </div>
              <div className="p-6">
                {clientAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Clients</p>
                        <p className="text-2xl font-bold text-white">{clientAnalytics.total_clients || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Active Clients</p>
                        <p className="text-2xl font-bold text-white">{clientAnalytics.active_clients || 0}</p>
                      </div>
                    </div>
                    {clientAnalytics.stage_distribution && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-3">Clients by Stage</p>
                        <div className="space-y-2">
                          {Object.entries(clientAnalytics.stage_distribution).map(([stage, count]: [string, any]) => (
                            <div key={stage} className="flex justify-between items-center">
                              <span className="text-white text-sm capitalize">{stage}</span>
                              <span className="text-primary font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">No client analytics available</p>
                )}
              </div>
            </div>
          </div>
          <div className="basis-[30%] flex flex-col justify-between gap-6">
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl basis-full p-6 flex flex-col items-center border border-white/10 shadow-lg">
              <div className="flex items-center justify-between w-full mb-4">
                <h2 className="text-2xl font-semibold text-white">Overview Analytics</h2>
              </div>
              {overviewAnalytics ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Portal Logins</p>
                      <p className="text-2xl font-bold text-white">{overviewAnalytics.portal_logins || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">AI Sessions</p>
                      <p className="text-2xl font-bold text-white">{overviewAnalytics.ai_sessions || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Tickets Created</p>
                      <p className="text-2xl font-bold text-white">{overviewAnalytics.tickets_created || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Meetings Scheduled</p>
                      <p className="text-2xl font-bold text-white">{overviewAnalytics.meetings_scheduled || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No overview analytics available</p>
              )}
            </div>
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl basis-full p-6 border border-white/10 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
              <div className="space-y-3">
                <div className="py-3 border-b border-white/10 flex gap-3 hover:bg-white/5 px-2 rounded transition-colors duration-200">
                  <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary/50 rounded-full flex-shrink-0 shadow-md"></div>
                  <p className="text-sm text-gray-300">Esther Howard</p>
                </div>
                <div className="py-3 border-b border-white/10 flex gap-3 hover:bg-white/5 px-2 rounded transition-colors duration-200">
                  <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary/50 rounded-full flex-shrink-0 shadow-md"></div>
                  <p className="text-sm text-gray-300">Esther Howard</p>
                </div>
                <div className="py-3 flex gap-3 hover:bg-white/5 px-2 rounded transition-colors duration-200">
                  <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary/50 rounded-full flex-shrink-0 shadow-md"></div>
                  <p className="text-sm text-gray-300">Esther Howard</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl basis-full p-6 border border-white/10 shadow-lg">
              <h2 className="text-lg font-semibold text-white text-center mb-4">Assistants</h2>
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-400 text-sm">No assistants assigned</p>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}
