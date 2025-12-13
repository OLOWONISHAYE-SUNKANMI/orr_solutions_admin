"use client";

import { Calendar, Users, FileText, Clock, CheckCircle, UserCheck, Loader } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { meetingAPI, contentAPI, settingsAPI } from "@/app/services";

export default function ConsultationsPage() {
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    consultants: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [meetingStats, contentResponse, usersResponse] = await Promise.all([
          meetingAPI.getStats().catch(() => ({ data: {} })),
          contentAPI.listContent({ content_type: 'report' }).catch(() => ({ data: [] })),
          settingsAPI.listUsers().catch(() => ({ data: [] }))
        ]);

        const meetingData = meetingStats?.data || meetingStats || {};
        const contentData = contentResponse?.data || contentResponse || [];
        const usersData = usersResponse?.data || usersResponse || [];

        setStats({
          scheduled: meetingData.confirmed_meetings || 0,
          completed: meetingData.completed_meetings || 0,
          consultants: Array.isArray(usersData) ? usersData.filter((user: any) => user.is_staff).length : 0,
          reports: Array.isArray(contentData) ? contentData.length : 0
        });
      } catch (err) {
        console.error('Failed to fetch consultation stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">All Consultations</h1>
            <p className="text-gray-400">Manage consultation sessions</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.scheduled}</div>
                  <div className="text-xs text-gray-400">Scheduled</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.completed}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center">
                  <UserCheck className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.consultants}</div>
                  <div className="text-xs text-gray-400">Consultants</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-center">
                  <FileText className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.reports}</div>
                  <div className="text-xs text-gray-400">Reports</div>
                </div>
              </div>

              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/consultations/past" className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">Past Consultations</h3>
                      <p className="text-sm text-gray-400">{stats.completed} completed sessions</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">View completed consultation sessions and meeting notes</p>
                </Link>

                <Link href="/consultations/scheduled" className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors">Scheduled Consultations</h3>
                      <p className="text-sm text-gray-400">{stats.scheduled} upcoming sessions</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Manage upcoming consultation sessions and schedules</p>
                </Link>

                <Link href="/consultations/consultants" className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">Consultants</h3>
                      <p className="text-sm text-gray-400">{stats.consultants} available consultants</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Manage consultant assignments and availability</p>
                </Link>

                <Link href="/consultations/reports" className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-orange-300 transition-colors">Reports</h3>
                      <p className="text-sm text-gray-400">{stats.reports} consultation reports</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">View and manage consultation reports and documentation</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
