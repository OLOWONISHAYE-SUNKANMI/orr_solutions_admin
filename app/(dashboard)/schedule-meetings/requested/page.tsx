"use client";

import { useState, useEffect } from "react";
import { Clock, User, Calendar, CheckCircle, XCircle, Edit, Loader, AlertCircle, MapPin, ExternalLink } from "lucide-react";
import { meetingAPI, authAPI } from "@/app/services";
import type { Meeting } from "@/app/services/types";
import { useLanguageStore } from "@/store/languageStore";

export default function RequestedMeetingsPage() {
  const { t } = useLanguageStore();
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
      setError(t('schedule_meetings.error_user'));
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
      setError(err.message || t('schedule_meetings.error_requested'));
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
    if (!dateString) return t('schedule_meetings.no_specified');
    try {
      const date = new Date(dateString);
      const { language } = useLanguageStore.getState();
      return date.toLocaleString(language === 'en' ? "en-US" : "it-IT", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return t('schedule_meetings.invalid_date');
    }
  };

  const getMeetingTypeDisplay = (type: string) => {
    return t(`schedule_meetings.types.${type}` as any) || type;
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('schedule_meetings.requested_title')}</h1>
            <p className="text-gray-400">{t('schedule_meetings.requested_subtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">{t('common.error')}</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {meetings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('schedule_meetings.no_requested')}</h3>
              <p className="text-gray-400">{t('schedule_meetings.no_requested_desc')}</p>
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
                            <span className="text-black">•</span>
                            <span>{meeting.client_company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                            <Calendar size={16} />
                            <span>{t('schedule_meetings.requested' as any) || 'Requested'}: {formatDateTime(meeting.requested_datetime)}</span>
                            <span className="text-black">•</span>
                            <span>{meeting.duration_minutes} {t('meetings.minutes')}</span>
                          </div>
                          {meeting.agenda && (
                            <div className="bg-white/5 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-300">
                                <span className="font-medium text-white">{t('schedule_meetings.agenda')}:</span> {meeting.agenda}
                              </p>
                            </div>
                          )}
                          {meeting.meeting_link && (
                            <div className="bg-blue-500/10 rounded-lg p-3 mb-3 border border-blue-500/20">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400" />
                                <span className="font-medium text-blue-300">{t('schedule_meetings.meeting_link') || 'Meeting Link'}:</span>
                                {meeting.meeting_link === 'pending-google-workspace' ? (
                                  <span className="text-yellow-400 text-sm italic font-medium">
                                    Preparing Google Meet Link...
                                  </span>
                                ) : (
                                  <a 
                                    href={meeting.meeting_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                                  >
                                    {t('schedule_meetings.join_meeting') || 'Join Meeting'}
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                          {meeting.internal_notes && (
                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                              <p className="text-sm text-blue-200">
                                <span className="font-medium">{t('schedule_meetings.internal_notes')}:</span> {meeting.internal_notes}
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
                        {t('meetings.confirm')}
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
                        {t('schedule_meetings.reschedule')}
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
                        {t('meetings.decline')}
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