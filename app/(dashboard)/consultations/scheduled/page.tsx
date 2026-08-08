"use client";

import { Calendar, Clock, User, Loader, MapPin, Phone, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { meetingAPI } from "@/app/services";
import Pagination from "@/app/components/common/Pagination";
import { useLanguageStore } from "@/store/languageStore";

interface Meeting {
  id: number;
  client_name: string;
  client_email: string;
  meeting_type: string;
  confirmed_datetime: string;
  duration_minutes: number;
  status: string;
  agenda?: string;
  meeting_link?: string;
  host?: {
    first_name: string;
    last_name: string;
  };
}

export default function ScheduledConsultationsPage() {
  const { t, language } = useLanguageStore();
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const fetchScheduledMeetings = async () => {
      try {
        setLoading(true);
        const response = await meetingAPI.listMeetings({ status: 'confirmed', upcoming: 'true' });
        const data = (response as any)?.data || response;
        setAllMeetings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch scheduled meetings:', err);
        setError(t('consultations.error_loading_scheduled'));
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledMeetings();
  }, [t]);

  const handleJoinMeeting = async (e: React.MouseEvent, meetingId: number, meetingLink: string) => {
    e.preventDefault();
    try {
      await meetingAPI.notifyHostJoined(meetingId);
    } catch (err) {
      console.error("Failed to notify that host joined:", err);
    }
    window.open(meetingLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('consultations.scheduled_page_title')}</h1>
            <p className="text-gray-400">{t('consultations.scheduled_page_subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : (() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedMeetings = allMeetings.slice(startIndex, endIndex);

            return allMeetings.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Clock size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('consultations.no_scheduled')}</h3>
                <p className="text-gray-400">{t('consultations.no_scheduled_desc')}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    {t('consultations.showing_meetings')} {paginatedMeetings.length} {t('consultations.of')} {allMeetings.length} {allMeetings.length !== 1 ? t('consultations.consultations') : t('consultations.consultation')}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {paginatedMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{meeting.client_name}</h3>
                              <p className="text-sm text-gray-400">{meeting.client_email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(meeting.confirmed_datetime).toLocaleString(language === 'en' ? 'en-US' : 'it-IT')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <User className="w-4 h-4" />
                              <span>{meeting.meeting_type} ({meeting.duration_minutes} min)</span>
                            </div>
                            {meeting.host && (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <User className="w-4 h-4" />
                                <span>{t('consultations.host')}: {meeting.host.first_name} {meeting.host.last_name}</span>
                              </div>
                            )}
                          </div>

                          {meeting.agenda && (
                            <div className="bg-white/5 rounded-lg p-3 mb-4">
                              <p className="text-sm text-gray-300">
                                <strong>{t('consultations.agenda')}:</strong> {meeting.agenda}
                              </p>
                            </div>
                          )}

                          {meeting.meeting_link && (
                            <div className="bg-blue-500/10 rounded-lg p-3 mb-4 border border-blue-500/20 w-fit">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400" />
                                <span className="font-medium text-blue-300">Meeting Link:</span>
                                {meeting.meeting_link === 'pending-google-workspace' ? (
                                  <span className="text-yellow-400 text-sm italic font-medium">
                                    Preparing Google Meet Link...
                                  </span>
                                ) : (
                                  <a 
                                    href={meeting.meeting_link} 
                                    onClick={(e) => handleJoinMeeting(e, meeting.id, meeting.meeting_link || "")}
                                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 text-sm cursor-pointer"
                                  >
                                    Join Meeting
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                            {t(`tickets.status_${meeting.status}`) !== `tickets.status_${meeting.status}` ? t(`tickets.status_${meeting.status}`) : meeting.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {allMeetings.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(allMeetings.length / itemsPerPage)}
                    totalItems={allMeetings.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newItemsPerPage) => {
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
