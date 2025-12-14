"use client";

import { Bell, AlertCircle, Calendar, Users, FileText } from "lucide-react";
import { Notification, TicketListItem, MeetingListItem } from "@/app/services/types";
import PermissionGuard from "../admin/PermissionGuard";

interface ActivityFeedProps {
  notifications: Notification[];
  tickets: TicketListItem[];
  meetings: MeetingListItem[];
  loading?: boolean;
}

export default function ActivityFeed({ notifications, tickets, meetings, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10 animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-white/5 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notifications */}
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
            {notifications.slice(0, 5).map((notif) => (
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
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No pending notifications</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        {/* Support Tickets */}
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
                {tickets.length}
              </span>
            </div>

            {tickets.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {tickets.slice(0, 3).map((ticket) => (
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
              <div className="text-center py-6">
                <AlertCircle size={32} className="text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No pending tickets</p>
              </div>
            )}
          </div>
        </PermissionGuard>

        {/* Upcoming Meetings */}
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
                {meetings.length}
              </span>
            </div>

            {meetings.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {meetings.slice(0, 3).map((meeting) => (
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
              <div className="text-center py-6">
                <Calendar size={32} className="text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No upcoming meetings</p>
              </div>
            )}
          </div>
        </PermissionGuard>
      </div>
    </div>
  );
}