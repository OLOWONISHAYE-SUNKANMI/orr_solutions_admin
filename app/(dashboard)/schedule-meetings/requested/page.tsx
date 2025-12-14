"use client";

import { useState, useEffect } from "react";
import { Clock, User, Calendar, CheckCircle, XCircle, Edit, Loader, AlertCircle } from "lucide-react";
import { meetingAPI, authAPI } from "@/app/services";
import type { Meeting } from "@/app/services/types";

export default function RequestedMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);
      const userId = (userData as any)?.id;
      await fetchRequestedMeetings(userId);
    } catch (err: any) {
      console.error("Failed to fetch current user:", err);
      setError("Failed to load user information");
      setLoading(false);
    }
  };

  const fetchRequestedMeetings = async (userId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await meetingAPI.getRequestedMeetings(userId) as any;
      console.log('Requested meetings response:', response);
      const meetingsData = Array.isArray(response) ? response : (response.results || response.data || []);
      setMeetings(meetingsData);
    } catch (err: any) {
      console.error("Failed to fetch requested meetings:", err);
      setError(err.message || "Failed to load requested meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingAction = async (meetingId: number, action: "confirm" | "reschedule" | "decline" | "complete" | "cancel", data?: any) => {
    try {
      setActionLoading(meetingId);
      await meetingAPI.performAction(meetingId, action, data);
      await fetchRequestedMeetings((currentUser as any)?.id);
    } catch (err: any) {
      console.error(`Failed to ${action} meeting:`, err);
      setError(err.message || `Failed to ${action} meeting`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid date";
    }
  };

  const getMeetingTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      discovery: "Discovery Meeting",
      consultation: "Consultation",
      follow_up: "Follow-up Meeting",
      review: "Review Meeting"
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Requested Meetings</h1>
            <p className="text-gray-400">Review and manage meeting requests from clients</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">Error</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {meetings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Requested Meetings</h3>
              <p className="text-gray-400">There are no pending meeting requests at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 p-6 hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-lg">
                          <Clock className="text-yellow-400" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {getMeetingTypeDisplay(meeting.meeting_type)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <User size={16} />
                            <span>{meeting.client_name}</span>
                            <span className="text-gray-500">•</span>
                            <span>{meeting.client_company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                            <Calendar size={16} />
                            <span>Requested: {formatDateTime(meeting.requested_datetime)}</span>
                            <span className="text-gray-500">•</span>
                            <span>{meeting.duration_minutes} minutes</span>
                          </div>
                          {meeting.agenda && (
                            <div className="bg-white/5 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-300">
                                <span className="font-medium text-white">Agenda:</span> {meeting.agenda}
                              </p>
                            </div>
                          )}
                          {meeting.internal_notes && (
                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                              <p className="text-sm text-blue-200">
                                <span className="font-medium">Internal Notes:</span> {meeting.internal_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[300px]">
                      <button
                        onClick={() => handleMeetingAction(meeting.id, 'confirm')}
                        disabled={actionLoading === meeting.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-lg text-white text-sm font-medium transition-all duration-200"
                      >
                        {actionLoading === meeting.id ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          const newDateTime = prompt("Enter new date and time (YYYY-MM-DD HH:MM):");
                          if (newDateTime) {
                            handleMeetingAction(meeting.id, 'reschedule', { 
                              confirmed_datetime: new Date(newDateTime).toISOString() 
                            });
                          }
                        }}
                        disabled={actionLoading === meeting.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm font-medium transition-all duration-200"
                      >
                        <Edit size={16} />
                        Reschedule
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Reason for declining (optional):");
                          handleMeetingAction(meeting.id, 'decline', { notes: reason || '' });
                        }}
                        disabled={actionLoading === meeting.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 rounded-lg text-white text-sm font-medium transition-all duration-200"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
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