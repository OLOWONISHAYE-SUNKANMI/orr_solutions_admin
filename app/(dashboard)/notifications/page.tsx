"use client";

import { useState, useEffect } from "react";
import { Bell, Ticket, Calendar, AlertCircle, MessageSquare, Settings, Trash2, Check, Loader } from "lucide-react";
import { notificationAPI } from "@/app/services";
import type { Notification } from "@/app/services/types";

const typeIcons: Record<string, any> = {
  ticket_created: Ticket,
  ticket_assigned: Ticket,
  meeting_assigned: Calendar,
  meeting_confirmed: Calendar,
  client_updated: AlertCircle,
  content_published: MessageSquare,
  system_alert: AlertCircle,
};

const typeColors: Record<string, string> = {
  ticket_created: "bg-blue-500/30 text-blue-300",
  ticket_assigned: "bg-blue-500/30 text-blue-300",
  meeting_assigned: "bg-primary/30 text-primary",
  meeting_confirmed: "bg-primary/30 text-primary",
  client_updated: "bg-purple-500/30 text-purple-300",
  content_published: "bg-green-500/30 text-green-300",
  system_alert: "bg-red-500/30 text-red-300",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.listNotifications({
          is_read: filterRead !== "all" ? filterRead === "read" : undefined,
        }) as any;
        // Handle both array response and object with results
        setNotifications(Array.isArray(response) ? response : (response.results || []));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filterRead]);

  const filteredNotifications = notifications.filter((notif) => {
    if (filterRead === "all") return true;
    if (filterRead === "unread") return !notif.is_read;
    if (filterRead === "read") return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 text-sm mt-2">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as "all" | "unread" | "read")}
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
              >
                <option value="all" className="bg-gray-800">All Notifications</option>
                <option value="unread" className="bg-gray-800">Unread</option>
                <option value="read" className="bg-gray-800">Read</option>
              </select>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => {
                  const Icon = typeIcons[notif.notification_type];
                  return (
                    <div
                      key={notif.id}
                      className={`bg-gradient-to-r from-white/15 to-white/5 rounded-xl border transition-all duration-200 p-4 flex items-start gap-4 ${
                        notif.is_read ? "border-white/10" : "border-primary/30 bg-primary/5"
                      } hover:shadow-lg`}
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[notif.notification_type]}`}>
                        <Icon size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${notif.is_read ? "text-gray-300" : "text-white"}`}>
                            {notif.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-600 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-primary"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 p-12 text-center">
                  <Bell size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications to display</p>
                </div>
              )}
            </div>

            {/* Settings Link */}
            <div className="border-t border-white/10 pt-6">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200">
                <Settings size={18} />
                <span className="font-medium">Configure notification preferences</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
