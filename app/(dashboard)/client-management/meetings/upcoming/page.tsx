"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin, Loader, Eye } from "lucide-react";
import { meetingAPI } from "@/app/services";
import type { MeetingListItem } from "@/app/services/types";

export default function UpcomingMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await meetingAPI.getUpcomingMeetings() as any;
      console.log('Upcoming meetings API response:', response);
      const meetingsData = Array.isArray(response) ? response : (response.results || response.data || []);
      console.log('Processed meetings data:', meetingsData);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (err: any) {
      console.error("Failed to fetch upcoming meetings:", err);
      setError(err.message || "Failed to load meetings");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMeetingTypeColor = (type: string) => {
    const colors = {
      discovery: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      follow_up: "bg-green-500/20 text-green-300 border-green-500/30",
      consultation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      review: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Upcoming Client Meetings</h1>
            <p className="text-gray-400">Scheduled meetings</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Clock size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Meetings</h3>
              <p className="text-gray-400">No confirmed upcoming meetings scheduled</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(meetings) && meetings.map((meeting) => (
                <div key={meeting.id} className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{meeting.client_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${getMeetingTypeColor(meeting.meeting_type)}`}>
                          {meeting.meeting_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{meeting.client_company}</p>
                      {meeting.host_name && (
                        <p className="text-sm text-gray-500">Host: {meeting.host_name}</p>
                      )}
                    </div>
                    <Calendar className="text-green-400" size={24} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Scheduled Time</label>
                      <p className="text-sm text-white">{formatDateTime(meeting.confirmed_datetime || meeting.requested_datetime)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Duration</label>
                      <p className="text-sm text-white">{meeting.duration_minutes} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                      Status: <span className="text-green-400">Confirmed</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Eye size={14} />
                      View Details
                    </button>
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
