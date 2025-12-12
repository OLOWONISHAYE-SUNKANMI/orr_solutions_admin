"use client";

import { Bell, AlertCircle, Info, CheckCircle, XCircle, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationAPI } from "@/app/services";
import type { Notification } from "@/app/services/types";

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationAPI.listNotifications() as any;
        const notifList = Array.isArray(data) ? data : (data.results || []);
        setNotifications(notifList.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications");
        // Fallback to sample data
        setNotifications([
          { id: 1, type: "info", title: "System Update", message: "New features available", created_at: new Date().toISOString() },
          { id: 2, type: "warning", title: "Maintenance Scheduled", message: "System maintenance scheduled", created_at: new Date().toISOString() },
          { id: 3, type: "success", title: "Backup Complete", message: "Daily backup completed successfully", created_at: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
      case "ticket_created":
      case "system_alert": return <Info className="text-blue-400" />;
      case "warning": return <AlertCircle className="text-orange-400" />;
      case "success":
      case "content_published": return <CheckCircle className="text-green-400" />;
      case "error": return <XCircle className="text-red-400" />;
      default: return <Bell className="text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">System Notifications</h1>
            <p className="text-gray-400">Important system alerts and updates</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getIcon(notif.notification_type || notif.type)}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{notif.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{notif.message}</p>
                      <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
