"use client";

import { useState } from "react";
import { X, Bell, Loader, AlertCircle, CheckCircle, Users, Globe } from "lucide-react";
import { notificationAPI } from "@/app/services";
import type { NotificationType } from "@/app/services/types";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAnnouncementModal({ isOpen, onClose }: CreateAnnouncementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    notification_type: "system_alert" as NotificationType,
    title: "",
    message: "",
    target_audience: "all", // all, admins, clients
    priority: "normal", // low, normal, high, urgent
    send_email: false,
    send_push: false,
  });

  const notificationTypes = [
    { value: "system_alert", label: "System Alert", icon: Bell },
    { value: "content_published", label: "Content Published", icon: Globe },
    { value: "client_updated", label: "Client Update", icon: Users },
  ];

  const audiences = [
    { value: "all", label: "All Users" },
    { value: "admins", label: "Admin Users Only" },
    { value: "clients", label: "Client Users Only" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-blue-400" },
    { value: "normal", label: "Normal", color: "text-green-400" },
    { value: "high", label: "High", color: "text-orange-400" },
    { value: "urgent", label: "Urgent", color: "text-red-400" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const notificationData = {
        notification_type: formData.notification_type,
        title: formData.title,
        message: formData.message,
        target_audience: formData.target_audience,
        priority: formData.priority,
        send_email: formData.send_email,
        send_push: formData.send_push,
      };

      console.log('🔔 Creating notification with data:', notificationData);
      const result = await notificationAPI.createNotification(notificationData);
      console.log('✅ Notification created successfully:', result);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          notification_type: "system_alert" as NotificationType,
          title: "",
          message: "",
          target_audience: "all",
          priority: "normal",
          send_email: false,
          send_push: false,
        });
      }, 2000);
    } catch (err: any) {
      console.error("❌ Failed to create announcement:", err);
      let errorMessage = err.message || "Failed to create announcement";
      
      // Handle specific error types
      if (errorMessage.includes('duplicate key')) {
        errorMessage = "An announcement with this title already exists. Please use a different title.";
      } else if (errorMessage.includes('validation')) {
        errorMessage = "Please check your input. Title and message are required fields.";
      } else if (errorMessage.includes('permission')) {
        errorMessage = "You don't have permission to create announcements. Please contact your administrator.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Announcement</h2>
              <p className="text-gray-400 text-sm">Send system notification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">Error</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-green-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-green-300">Success</p>
                <p className="text-green-200">Announcement created successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Notification Type</label>
              <div className="grid grid-cols-1 gap-3">
                {notificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        formData.notification_type === type.value
                          ? "bg-primary/20 border-primary/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_type"
                        value={type.value}
                        checked={formData.notification_type === type.value}
                        onChange={(e) => handleInputChange("notification_type", e.target.value)}
                        className="sr-only"
                      />
                      <Icon size={20} className="text-gray-400" />
                      <span className="text-sm text-white">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Enter your announcement message..."
                rows={5}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Target Audience</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange("target_audience", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {audiences.map((audience) => (
                    <option key={audience.value} value={audience.value} className="bg-gray-800">
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value} className="bg-gray-800">
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-gray-400 block">Delivery Options</label>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={formData.send_email}
                    onChange={(e) => handleInputChange("send_email", e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                  />
                  Send email notification
                </label>

                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={formData.send_push}
                    onChange={(e) => handleInputChange("send_push", e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                  />
                  Send push notification
                </label>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-white">
                    {formData.title || "Announcement Title"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    formData.priority === "urgent" ? "bg-red-500/20 text-red-300" :
                    formData.priority === "high" ? "bg-orange-500/20 text-orange-300" :
                    formData.priority === "normal" ? "bg-green-500/20 text-green-300" :
                    "bg-blue-500/20 text-blue-300"
                  }`}>
                    {formData.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {formData.message || "Your announcement message will appear here..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Bell size={16} />
                )}
                {loading ? "Sending..." : "Send Announcement"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}