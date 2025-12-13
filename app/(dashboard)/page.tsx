"use client";

import {
  billingAPI,
  clientAPI,
  contentAPI,
  dashboardAPI,
  meetingAPI,
  notificationAPI,
  ticketAPI,
} from "@/app/services";
import type {
  ContentListItem,
  DashboardMetrics,
  MeetingListItem,
  Notification,
  TicketListItem,
} from "@/app/services/types";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader,
  Users,
  Wallet,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { useRole, useIsSuperAdmin } from "@/lib/rbac";

function page() {
  const router = useRouter();
  const role = useRole();
  const isSuperAdmin = useIsSuperAdmin();

  const defaultMetrics: DashboardMetrics = {
    active_clients: 0,
    pending_tickets: 0,
    upcoming_meetings: 0,
    system_notifications: 0,
    portal_logins: 0,
    ai_chat_sessions: 0,
    escalation_rate: 0,
  };

  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingTickets, setPendingTickets] = useState<TicketListItem[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingListItem[]>([]);
  const [recentContent, setRecentContent] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [upcomingConsultations, setUpcomingConsultations] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [metricsData, notificationsData, ticketsData, meetingsData, contentData, billingStatsData, clientStatsData] =
          await Promise.all([
            dashboardAPI.getOverview().catch(() => null),
            notificationAPI
              .listNotifications({ is_read: false })
              .catch(() => ({ results: [] })),
            ticketAPI
              .listTickets({ status: "new" })
              .catch(() => ({ results: [] })),
            meetingAPI.getUpcomingMeetings().catch(() => ({ results: [] })),
            contentAPI.listContent({ limit: 5 }).catch(() => ({ results: [] })),
            billingAPI.getStats().catch(() => null),
            clientAPI.getStats().catch(() => null),
          ]);

        // Type-safe data extraction
        setMetrics(
          metricsData && typeof metricsData === "object" && "active_clients" in metricsData
            ? (metricsData as DashboardMetrics)
            : defaultMetrics
        );

        const extractArray = (data: any): any[] => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object" && "results" in data && Array.isArray(data.results))
            return data.results;
          return [];
        };

        setNotifications(extractArray(notificationsData) as Notification[]);
        setPendingTickets(extractArray(ticketsData) as TicketListItem[]);
        setUpcomingMeetings(extractArray(meetingsData) as MeetingListItem[]);
        setRecentContent(extractArray(contentData) as ContentListItem[]);
        
        // Set wallet balance from billing stats
        if (billingStatsData && typeof billingStatsData === "object" && "total_revenue" in billingStatsData) {
          const revenue = billingStatsData.total_revenue;
          setWalletBalance(typeof revenue === "string" ? parseFloat(revenue.replace(/[^0-9.-]/g, "")) : (typeof revenue === "number" ? revenue : 0));
        }
        
        // Set upcoming consultations based on meetings data
        const meetings = extractArray(meetingsData) as MeetingListItem[];
        setUpcomingConsultations(meetings.length);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load some dashboard data");
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
    <div className="max-h-screen overflow-y-auto text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10 p-4 md:p-8">
        {/* 3-PART OPENING SECTION */}
        <div className="space-y-6 mb-8">
          {/* PART 1: WELCOME HERO */}
          <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-transparent rounded-2xl p-8 md:p-12 border border-primary/30 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                  Welcome back, {role?.replace('_', ' ').toUpperCase()}
                  {isSuperAdmin && ' 👑'}
                </h1>
                <p className="text-gray-300 text-lg mb-4">
                  You're all set to manage operations and drive client success.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={16} />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center w-24 h-24 bg-primary/20 rounded-full border border-primary/30">
                <TrendingUp size={48} className="text-primary" />
              </div>
            </div>
          </div>

          {/* PART 2: KEY INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Wallet Balance</h3>
                <Wallet size={18} className="text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-white">€{walletBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-2">Available credits</p>
            </div>

            {/* Upcoming Consultations Card */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Upcoming Consultations</h3>
                <Calendar size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-white">{upcomingConsultations}</p>
              <p className="text-xs text-gray-400 mt-2">Next 7 days</p>
            </div>

            {/* Key Notifications Card */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Key Notifications</h3>
                <Bell size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-white">{notifications.length}</p>
              <p className="text-xs text-gray-400 mt-2">Pending actions</p>
            </div>
          </div>

          {/* PART 3: RECOMMENDED ACTIONS */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <ArrowRight size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PermissionGuard permissions={['can_view_all_clients']}>
                <button 
                  onClick={() => router.push("/client-management")}
                  className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <Users size={20} className="text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-white text-sm">Review Active Clients</p>
                    <p className="text-xs text-gray-400">Check client status and engagement</p>
                  </div>
                </button>
              </PermissionGuard>
              <PermissionGuard permissions={['can_manage_tickets']}>
                <button 
                  onClick={() => router.push("/tickets")}
                  className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <AlertCircle size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-white text-sm">Handle Support Tickets</p>
                    <p className="text-xs text-gray-400">Respond to pending requests</p>
                  </div>
                </button>
              </PermissionGuard>
              <PermissionGuard permissions={['can_manage_meetings']}>
                <button 
                  onClick={() => router.push("/consultations")}
                  className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <Calendar size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-white text-sm">Schedule Consultations</p>
                    <p className="text-xs text-gray-400">Manage upcoming meetings</p>
                  </div>
                </button>
              </PermissionGuard>
              <PermissionGuard permissions={['can_create_content', 'can_publish_content']}>
                <button 
                  onClick={() => router.push("/content-management")}
                  className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <FileText size={20} className="text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-white text-sm">Manage Content</p>
                    <p className="text-xs text-gray-400">Create and publish resources</p>
                  </div>
                </button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Key Metrics - Grid Pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Active Clients Card */}
              <PermissionGuard permissions={['can_view_all_clients']}>
                <div className="group relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-4">
                    <div className="bg-primary/30 w-14 h-14 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm font-medium">Active Clients</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold text-white">
                          {metrics.active_clients}
                        </p>
                        <span className="text-primary text-xs">Portal active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PermissionGuard>

              {/* Pending Tickets Card */}
              <PermissionGuard permissions={['can_manage_tickets']}>
                <div className="group relative bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-6 border border-orange-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-4">
                    <div className="bg-orange-500/30 w-14 h-14 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="w-7 h-7 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm font-medium">Pending Tickets</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold text-white">
                          {metrics.pending_tickets}
                        </p>
                        <span className="text-orange-400 text-xs">Awaiting action</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PermissionGuard>

              {/* Upcoming Meetings Card */}
              <PermissionGuard permissions={['can_manage_meetings']}>
                <div className="group relative bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-4">
                    <div className="bg-blue-500/30 w-14 h-14 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm font-medium">Upcoming Meetings</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold text-white">
                          {metrics.upcoming_meetings}
                        </p>
                        <span className="text-blue-400 text-xs">Next 7 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PermissionGuard>
            </div>

          {/* Two Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* left Column - Meetings */}
            <PermissionGuard permissions={['can_manage_meetings']}>
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 p-5 md:p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Calendar size={18} className="text-blue-400" />
                  </div>
                  Upcoming Meetings
                </h2>
                <span className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                  {upcomingMeetings.length}
                </span>
              </div>

              {upcomingMeetings.length > 0 ? (
                <div className="space-y-2 max-h-[680px] overflow-y-auto">
                  {upcomingMeetings.slice(0, 10).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 transition-all duration-200 group/item"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white group-hover/item:text-blue-300 transition-colors">
                            {meeting.client_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              meeting.confirmed_datetime || meeting.requested_datetime
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {meeting.meeting_type} • {meeting.duration_minutes} min
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 flex-shrink-0 font-medium">
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">
                  No upcoming meetings
                </p>
              )}
            </div>
            </PermissionGuard>
            {/* Left Column - Notifications & Tickets */}

            <div className="space-y-6">
              {/* Pending Notifications Widget */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 p-5 md:p-6 hover:border-primary/30 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <Bell size={18} className="text-primary" />
                    </div>
                    Notifications
                  </h2>
                  <span className="bg-primary/30 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {notifications.length}
                  </span>
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {notifications.slice(0, 5).map((notif, idx) => (
                      <div
                        key={notif.id}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 transition-all duration-200 flex items-start gap-3 group/item"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No pending notifications
                  </p>
                )}
              </div>

              {/* Pending Tickets Widget */}
              <PermissionGuard permissions={['can_manage_tickets']}>
                <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 p-5 md:p-6 hover:border-orange-500/30 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                      <AlertCircle size={18} className="text-orange-400" />
                    </div>
                    Support Tickets
                  </h2>
                  <span className="bg-orange-500/30 text-orange-300 px-3 py-1 rounded-full text-xs font-bold">
                    {pendingTickets.length}
                  </span>
                </div>

                {pendingTickets.length > 0 ? (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {pendingTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 transition-all duration-200 group/item"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover/item:text-primary transition-colors">
                              {ticket.ticket_id}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                              {ticket.subject}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {ticket.client_name}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium flex-shrink-0 ${
                            ticket.priority === "urgent"
                              ? "bg-red-500/20 text-red-300"
                              : ticket.priority === "high"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No pending tickets
                  </p>
                )}
              </div>
              </PermissionGuard>
            </div>
          </div>

          {/* Recent Content Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Content Table */}
            <PermissionGuard permissions={['can_create_content', 'can_publish_content']}>
              <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-primary/30 transition-all duration-300">
              <div className="p-5 md:p-6 border-b border-white/10 flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText size={18} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Recent Content</h2>
              </div>
              {recentContent.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left p-4 text-primary font-semibold text-sm">Title</th>
                        <th className="text-left p-4 text-primary font-semibold text-sm hidden sm:table-cell">Type</th>
                        <th className="text-left p-4 text-primary font-semibold text-sm">Status</th>
                        <th className="text-left p-4 text-primary font-semibold text-sm hidden lg:table-cell">Views</th>
                        <th className="text-left p-4 text-primary font-semibold text-sm hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentContent.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-200 group/row">
                          <td className="py-3 px-4">
                            <span className="text-white font-medium line-clamp-1 text-sm group-hover/row:text-primary transition-colors">
                              {item.title}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm hidden sm:table-cell">
                            <span className="capitalize">{item.content_type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`w-fit px-3 py-1 rounded-lg font-medium text-xs capitalize ${
                              item.status === "published"
                                ? "bg-primary/30 text-primary border border-primary/30"
                                : item.status === "draft"
                                ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                                : "bg-gray-500/30 text-gray-300 border border-gray-500/30"
                            }`}>
                              {item.status}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm hidden lg:table-cell">
                            {item.view_count}
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm hidden md:table-cell">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No recent content available</p>
                </div>
              )}
              </div>
            </PermissionGuard>
          </div>

        </div>
      </div>
    </div>
  );
}

export default page;
