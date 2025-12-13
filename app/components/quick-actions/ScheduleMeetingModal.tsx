"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Loader, AlertCircle, CheckCircle, Users } from "lucide-react";
import { meetingAPI, clientAPI } from "@/app/services";
import type { MeetingType, ClientListItem } from "@/app/services/types";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose }: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    meeting_type: "discovery" as MeetingType,
    requested_datetime: "",
    duration_minutes: 60,
    agenda: "",
    internal_notes: "",
  });

  const meetingTypes = [
    { value: "discovery", label: "Discovery Meeting" },
    { value: "follow_up", label: "Follow-up Meeting" },
    { value: "consultation", label: "Consultation" },
    { value: "review", label: "Review Meeting" },
  ];

  const durations = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await clientAPI.listClients() as any;
      const clientsData = Array.isArray(response) ? response : (response.results || response.data || []);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Failed to fetch clients:", err);
      setError("Failed to load clients");
    } finally {
      setClientsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.requested_datetime || !formData.agenda) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const meetingData = {
        client_id: parseInt(formData.client_id),
        meeting_type: formData.meeting_type,
        requested_datetime: formData.requested_datetime,
        duration_minutes: formData.duration_minutes,
        agenda: formData.agenda,
        internal_notes: formData.internal_notes,
      };

      console.log('📅 Creating meeting with data:', meetingData);
      const result = await meetingAPI.createMeeting(meetingData);
      console.log('✅ Meeting created successfully:', result);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          client_id: "",
          meeting_type: "discovery" as MeetingType,
          requested_datetime: "",
          duration_minutes: 60,
          agenda: "",
          internal_notes: "",
        });
      }, 2000);
    } catch (err: any) {
      console.error("❌ Failed to schedule meeting:", err);
      let errorMessage = err.message || "Failed to schedule meeting";
      
      // Handle specific error types
      if (errorMessage.includes('duplicate key')) {
        errorMessage = "A meeting at this time already exists. Please choose a different time slot.";
      } else if (errorMessage.includes('validation')) {
        errorMessage = "Please check your input. Client, date/time, and agenda are required.";
      } else if (errorMessage.includes('past')) {
        errorMessage = "Cannot schedule meetings in the past. Please select a future date and time.";
      } else if (errorMessage.includes('permission')) {
        errorMessage = "You don't have permission to schedule meetings. Please contact your administrator.";
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

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
              <p className="text-gray-400 text-sm">Book a new client meeting</p>
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
                <p className="text-green-200">Meeting scheduled successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Client <span className="text-red-400">*</span>
              </label>
              {clientsLoading ? (
                <div className="flex items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-sm text-gray-400">Loading clients...</span>
                </div>
              ) : (
                <select
                  value={formData.client_id}
                  onChange={(e) => handleInputChange("client_id", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  required
                >
                  <option value="" className="bg-gray-800">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-gray-800">
                      {client.full_name} - {client.company}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Meeting Type</label>
                <select
                  value={formData.meeting_type}
                  onChange={(e) => handleInputChange("meeting_type", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {meetingTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Duration</label>
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value} className="bg-gray-800">
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Requested Date & Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.requested_datetime}
                onChange={(e) => handleInputChange("requested_datetime", e.target.value)}
                min={getCurrentDateTime()}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Agenda <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange("agenda", e.target.value)}
                placeholder="What will be discussed in this meeting?"
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Internal Notes</label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => handleInputChange("internal_notes", e.target.value)}
                placeholder="Add any internal notes about this meeting"
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || clientsLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Calendar size={16} />
                )}
                {loading ? "Scheduling..." : "Schedule Meeting"}
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