"use client";

import { useState } from "react";
import { Search, Download, Filter, LogOut, Edit, Lock, Trash2, Eye } from "lucide-react";

const auditLogs: any[] = [];

const typeIcons: Record<string, any> = {
  login: LogOut,
  content: Edit,
  role: Lock,
  client: Eye,
  ticket: Edit,
};

const typeColors: Record<string, string> = {
  login: "bg-blue-500/30 text-blue-300",
  content: "bg-primary/30 text-primary",
  role: "bg-red-500/30 text-red-300",
  client: "bg-purple-500/30 text-purple-300",
  ticket: "bg-orange-500/30 text-orange-300",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const typeMatch = filterType === "All" || log.type === filterType;
    const statusMatch = filterStatus === "All" || log.status === filterStatus;
    const searchMatch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const loginAttempts = logs.filter((l) => l.type === "login").length;
  const failedAttempts = logs.filter((l) => l.type === "login" && l.status === "failed").length;
  const contentChanges = logs.filter((l) => l.type === "content").length;
  const roleChanges = logs.filter((l) => l.type === "role").length;

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">Audit & Compliance</h1>
                <p className="text-gray-400 text-xs md:text-sm mt-2">System activity logs and compliance tracking</p>
              </div>
              <button className="bg-primary hover:bg-primary/80 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm w-full md:w-auto justify-center">
                <Download size={18} />
                Export Logs
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-4 border border-blue-500/20 shadow-lg">
                <p className="text-gray-400 text-sm mb-2">Total Login Attempts</p>
                <p className="text-3xl font-bold text-white">{loginAttempts}</p>
                <p className="text-red-400 text-xs mt-2">{failedAttempts} failed</p>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20 shadow-lg">
                <p className="text-gray-400 text-sm mb-2">Content Changes</p>
                <p className="text-3xl font-bold text-white">{contentChanges}</p>
                <p className="text-primary text-xs mt-2">Publish/Archive/Edit</p>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl p-4 border border-red-500/20 shadow-lg">
                <p className="text-gray-400 text-sm mb-2">Role Changes</p>
                <p className="text-3xl font-bold text-white">{roleChanges}</p>
                <p className="text-red-400 text-xs mt-2">Permission updates</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 border border-green-500/20 shadow-lg">
                <p className="text-gray-400 text-sm mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-white">
                  {((logs.filter((l) => l.status === "success").length / logs.length) * 100).toFixed(0)}%
                </p>
                <p className="text-green-400 text-xs mt-2">All operations</p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by user or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 text-sm"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
              >
                <option className="bg-gray-800">All Types</option>
                <option className="bg-gray-800">Login</option>
                <option className="bg-gray-800">Content</option>
                <option className="bg-gray-800">Role</option>
                <option className="bg-gray-800">Client</option>
                <option className="bg-gray-800">Ticket</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
              >
                <option className="bg-gray-800">All Status</option>
                <option className="bg-gray-800">Success</option>
                <option className="bg-gray-800">Failed</option>
              </select>
            </div>

            {/* Audit Log Table */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-primary font-semibold text-sm">Type</th>
                    <th className="text-left p-4 text-primary font-semibold text-sm">User</th>
                    <th className="text-left p-4 text-primary font-semibold text-sm">Action</th>
                    <th className="text-left p-4 text-primary font-semibold text-sm">Timestamp</th>
                    <th className="text-left p-4 text-primary font-semibold text-sm">IP Address</th>
                    <th className="text-left p-4 text-primary font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const Icon = typeIcons[log.type];
                    return (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/10 transition-colors duration-200">
                        <td className="p-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[log.type]}`}>
                            <Icon size={18} />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium text-sm">{log.user}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-300 text-sm line-clamp-2">{log.action}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-400 text-sm">{log.timestamp}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-500 text-sm font-mono">{log.ipAddress}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              log.status === "success"
                                ? "bg-green-500/30 text-green-300 border border-green-500/30"
                                : "bg-red-500/30 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {log.status === "success" ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* GDPR & Compliance Section */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">GDPR & Data Compliance</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200">
                  <div className="text-left">
                    <p className="text-white font-medium">Export User Data</p>
                    <p className="text-gray-400 text-sm mt-1">Download all data for a specific user (GDPR compliant)</p>
                  </div>
                  <Download size={20} className="text-primary" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200">
                  <div className="text-left">
                    <p className="text-white font-medium">Delete User Data</p>
                    <p className="text-gray-400 text-sm mt-1">Permanently delete all data for a user (irreversible)</p>
                  </div>
                  <Trash2 size={20} className="text-red-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200">
                  <div className="text-left">
                    <p className="text-white font-medium">View Data Processing Agreement</p>
                    <p className="text-gray-400 text-sm mt-1">Review our data processing and privacy policies</p>
                  </div>
                  <Eye size={20} className="text-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
