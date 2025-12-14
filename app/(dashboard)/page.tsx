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
  FileText,
  Loader,
  Wallet,
  Calendar,
  Bell,
  Users,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { useRole, useIsSuperAdmin } from "@/lib/rbac/hooks";
import WelcomeHero from "@/app/components/dashboard/WelcomeHero";
import QuickActions from "@/app/components/dashboard/QuickActions";
import ActivityFeed from "@/app/components/dashboard/ActivityFeed";

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
              .catch(() => ({ data: [] })),
            ticketAPI
              .listTickets({ status: "new" })
              .catch(() => ({ data: [] })),
            meetingAPI.getUpcomingMeetings().catch(() => ({ data: [] })),
            contentAPI.listContent({ limit: 5 }).catch(() => ({ data: [] })),
            billingAPI.getAllPaymentStats().catch(() => null),
            clientAPI.getStats().catch(() => null),
          ]);

        // Extract data from API responses
        console.log('Dashboard API Responses:', {
          metricsData,
          notificationsData,
          ticketsData,
          meetingsData,
          contentData,
          billingStatsData,
          clientStatsData
        });

        const extractData = (response: any) => {
          if (!response) return null;
          return response.data || response;
        };

        const extractArray = (response: any): any[] => {
          const data = extractData(response);
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object" && "results" in data && Array.isArray(data.results))
            return data.results;
          return [];
        };

        // Set metrics from API responses
        const dashboardData = extractData(metricsData);
        const clientStats = extractData(clientStatsData);
        const notifications = extractArray(notificationsData);
        const tickets = extractArray(ticketsData);
        const meetings = extractArray(meetingsData);
        const content = extractArray(contentData);

        setMetrics({
          active_clients: dashboardData?.active_clients || clientStats?.active_clients || 0,
          pending_tickets: dashboardData?.pending_tickets?.new || tickets.length,
          upcoming_meetings: dashboardData?.upcoming_meetings || meetings.length,
          system_notifications: dashboardData?.system_notifications || notifications.length,
          portal_logins: dashboardData?.portal_logins_7days || 0,
          ai_chat_sessions: dashboardData?.ai_chat_sessions || 0,
          escalation_rate: dashboardData?.escalation_rate || 0,
        });

        setNotifications(notifications as Notification[]);
        setPendingTickets(tickets as TicketListItem[]);
        setUpcomingMeetings(meetings as MeetingListItem[]);
        setRecentContent(content as ContentListItem[]);
        
        // Set wallet balance from billing stats
        const billingData = extractData(billingStatsData);
        if (billingData && "total_revenue" in billingData) {
          const revenue = billingData.total_revenue;
          setWalletBalance(typeof revenue === "number" ? revenue : (typeof revenue === "string" ? parseFloat(revenue) : 0));
        }
        
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
          <WelcomeHero />

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

          {/* PART 3: QUICK ACTIONS */}
          <QuickActions />
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

          {/* Key Metrics - Enhanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Active Clients */}
            <PermissionGuard permissions={['can_view_all_clients']}>
              <div className="group relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => router.push('/client-management')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-primary/30 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{metrics.active_clients}</p>
                  <p className="text-sm text-gray-400">Active Clients</p>
                </div>
              </div>
            </PermissionGuard>

            {/* Pending Tickets */}
            <PermissionGuard permissions={['can_manage_tickets']}>
              <div className="group relative bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-6 border border-orange-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => router.push('/tickets')}>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-orange-500/30 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">Urgent</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{metrics.pending_tickets}</p>
                  <p className="text-sm text-gray-400">Support Tickets</p>
                </div>
              </div>
            </PermissionGuard>

            {/* Upcoming Meetings */}
            <PermissionGuard permissions={['can_manage_meetings']}>
              <div className="group relative bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => router.push('/consultations')}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-500/30 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">7 days</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{metrics.upcoming_meetings}</p>
                  <p className="text-sm text-gray-400">Meetings</p>
                </div>
              </div>
            </PermissionGuard>

            {/* Revenue/Wallet */}
            <PermissionGuard permissions={['can_view_billing']}>
              <div className="group relative bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-6 border border-green-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => router.push('/analytics/payments-billing')}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-green-500/30 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">€</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">€{walletBalance.toFixed(0)}</p>
                  <p className="text-sm text-gray-400">Revenue</p>
                </div>
              </div>
            </PermissionGuard>
          </div>

          {/* Activity Feed */}
          <ActivityFeed 
            notifications={notifications}
            tickets={pendingTickets}
            meetings={upcomingMeetings}
            loading={loading}
          />

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
