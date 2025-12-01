"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Filter } from "lucide-react";

const clientUsageData = [
  { week: "Week 1", logins: 120, activeClients: 18 },
  { week: "Week 2", logins: 145, activeClients: 22 },
  { week: "Week 3", logins: 98, activeClients: 15 },
  { week: "Week 4", logins: 167, activeClients: 24 },
];

const contentAnalyticsData = [
  { name: "FAQs", views: 450, downloads: 120 },
  { name: "Articles", views: 380, downloads: 95 },
  { name: "Checklists", views: 290, downloads: 180 },
  { name: "Templates", views: 520, downloads: 320 },
  { name: "Guides", views: 210, downloads: 65 },
];

const ticketAnalyticsData = [
  { status: "New", count: 8 },
  { status: "In Progress", count: 12 },
  { status: "Waiting", count: 5 },
  { status: "Resolved", count: 34 },
];

const aiChatData = [
  { day: "Mon", sessions: 45, escalated: 5 },
  { day: "Tue", sessions: 52, escalated: 6 },
  { day: "Wed", sessions: 38, escalated: 4 },
  { day: "Thu", sessions: 61, escalated: 8 },
  { day: "Fri", sessions: 55, escalated: 7 },
  { day: "Sat", sessions: 32, escalated: 3 },
  { day: "Sun", sessions: 28, escalated: 2 },
];

const stagePillarData = [
  { name: "Discover", value: 25, fill: "#0ec277" },
  { name: "Diagnose", value: 20, fill: "#f59e0b" },
  { name: "Design", value: 18, fill: "#3b82f6" },
  { name: "Deploy", value: 22, fill: "#8b5cf6" },
  { name: "Grow", value: 15, fill: "#ec4899" },
];

export default function AnalyticsReportingPage() {
  const [dateRange, setDateRange] = useState("7days");

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Analytics & Reporting</h1>
                <p className="text-gray-400 text-sm mt-2">Comprehensive usage and performance metrics</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">This Year</option>
                </select>
                <button className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Client Portal Usage */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Client Portal Usage</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clientUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="week" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #0ec277",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#0ec277"
                    strokeWidth={2}
                    dot={{ fill: "#0ec277", r: 4 }}
                    name="Portal Logins"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeClients"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    name="Active Clients"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Content Analytics */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Content Analytics</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff60" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #0ec277",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#0ec277" name="Views" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="downloads" fill="#3b82f6" name="Downloads" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ticket Analytics */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Ticket Status Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ticketAnalyticsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      <Cell fill="#0ec277" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #0ec277",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Chat Analytics */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">AI Chat Analytics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aiChatData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="day" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #0ec277",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sessions" fill="#0ec277" name="Total Sessions" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="escalated" fill="#ef4444" name="Escalated" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage & Pillar Distribution */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Content by Stage</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stagePillarData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stagePillarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #0ec277",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {stagePillarData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-gray-300">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics Summary */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Key Metrics Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">Total Portal Logins</span>
                    <span className="text-2xl font-bold text-primary">530</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">Most Viewed Resource</span>
                    <span className="text-lg font-semibold text-white">Templates (520)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">Avg. Ticket Resolution</span>
                    <span className="text-lg font-semibold text-white">2.3 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">AI Escalation Rate</span>
                    <span className="text-lg font-semibold text-orange-400">11.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">Meetings Requested</span>
                    <span className="text-lg font-semibold text-white">18</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300">Meetings Confirmed</span>
                    <span className="text-lg font-semibold text-primary">14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
