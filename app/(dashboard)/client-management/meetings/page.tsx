"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, FileText, Loader, Eye, Filter } from "lucide-react";
import { meetingAPI } from "@/app/services";
import type { MeetingListItem } from "@/app/services/types";
import { useLanguageStore } from "@/store/languageStore";

export default function UnifiedMeetingsPage() {
  const { t } = useLanguageStore();
  const [allMeetings, setAllMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'requested' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await meetingAPI.listMeetings({}) as any;
      const meetingsData = Array.isArray(response) ? response : (response.results || response.data || []);
      setAllMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (err: any) {
      console.error("Failed to fetch meetings:", err);
      setError(err.message || "Failed to load meetings");
      setAllMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const { language } = useLanguageStore.getState();
    return date.toLocaleString(language === 'en' ? "en-US" : "it-IT", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMeetingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      discovery: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      follow_up: "bg-green-500/20 text-green-300 border-green-500/30",
      consultation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      review: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };
    return colors[type] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return "bg-green-500/20 text-green-300 border-green-500/30";
    if (status === 'confirmed') return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (status === 'requested') return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const filteredMeetings = allMeetings.filter(m => activeTab === 'all' || m.status === activeTab);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('meetings.title')}</h1>
              <p className="text-gray-400">Manage all client meetings across the platform</p>
            </div>
            
            <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('requested')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === 'requested' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setActiveTab('confirmed')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === 'confirmed' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab === 'completed' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Past
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
                  {error}
                </div>
              )}

              {filteredMeetings.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No meetings found</h3>
                  <p className="text-gray-400">There are no meetings matching the current filter.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{meeting.client_name || 'Unknown Client'}</h3>
                            <span className={`text-xs px-2 py-1 rounded border ${getMeetingTypeColor(meeting.meeting_type)}`}>
                              {(meeting.meeting_type || 'Unknown').replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(meeting.status)}`}>
                              {(meeting.status || 'Unknown').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-1">{meeting.client_company}</p>
                          {meeting.host_name && (
                            <p className="text-sm text-gray-400">{t('meetings.host')}: {meeting.host_name}</p>
                          )}
                        </div>
                        {meeting.status === 'completed' && <CheckCircle className="text-green-400" size={24} />}
                        {meeting.status === 'confirmed' && <Clock className="text-blue-400" size={24} />}
                        {meeting.status === 'requested' && <Clock className="text-orange-400" size={24} />}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Date & Time</label>
                          <p className="text-sm text-white">{formatDateTime(meeting.confirmed_datetime || meeting.requested_datetime)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">{t('meetings.duration')}</label>
                          <p className="text-sm text-white">{meeting.duration_minutes} {t('meetings.minutes')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
