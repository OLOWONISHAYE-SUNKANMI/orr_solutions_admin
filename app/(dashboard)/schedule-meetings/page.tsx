"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, it } from "date-fns/locale";
import { Loader, CheckCircle, Clock, User as UserIcon, ChevronLeft, ChevronRight, Menu, Search, HelpCircle, Settings, Plus, Calendar as CalendarIcon, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { meetingAPI, authAPI } from "@/app/services";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  clientName: string;
  meetingType: string;
  meetingLink?: string;
  resource: { color: string };
}

function page() {
  const [date, setDate] = useState(new Date()); // Current date
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [aiPrepNotes, setAiPrepNotes] = useState<string | null>(null);
  const [isPrepping, setIsPrepping] = useState(false);

  const handlePrepNotes = async () => {
    if (!selectedEvent) return;
    setIsPrepping(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/ai/meeting-prep/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ meeting_id: selectedEvent.id })
      });
      const data = await response.json();
      setAiPrepNotes(data?.prep_notes || data?.data?.prep_notes || "Could not generate preparation notes.");
    } catch (err) {
      console.error("Failed to generate prep notes:", err);
      setAiPrepNotes("Failed to generate preparation notes. Please try again.");
    } finally {
      setIsPrepping(false);
    }
  };

  const locales = {
    "en": enUS,
    "it": it,
  };

  const [events, setEvents] = useState<Event[]>([]);
  const { t, language } = useLanguageStore();

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  // Fetch current user and meetings on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);
      const userId = (userData as any)?.id;
      await fetchMeetings(userId);
    } catch (err: any) {
      console.error("Failed to fetch current user:", err);
      setLoading(false);
    }
  };

  const fetchMeetings = async (userId?: number) => {
    try {
      setLoading(true);
      const data = await meetingAPI.listMeetings({ host_id: userId }).catch(() => ({ results: [] }));
      console.log('All meetings response:', data);
      const meetingsList = Array.isArray(data) ? data : ((data as any)?.results || (data as any)?.data || []);

      // Transform API data to Event format
      const transformedEvents: Event[] = meetingsList.map((meeting: any) => {
        const meetingDateTime = meeting.confirmed_datetime || meeting.requested_datetime;
        const endDateTime = new Date(new Date(meetingDateTime).getTime() + (meeting.duration_minutes || 60) * 60000);

        return {
          id: meeting.id,
          title: `${getMeetingTypeDisplay(meeting.meeting_type)} - ${meeting.client_name}`,
          start: new Date(meetingDateTime),
          end: endDateTime,
          status: meeting.status,
          clientName: meeting.client_name,
          meetingType: meeting.meeting_type,
          meetingLink: meeting.meeting_link,
          resource: { color: getStatusColor(meeting.status) },
        };
      });

      console.log('Transformed events:', transformedEvents);

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingAction = async (meetingId: number, action: "confirm" | "reschedule" | "decline" | "complete" | "cancel", data?: any) => {
    try {
      setActionLoading(meetingId);
      await meetingAPI.performAction(meetingId, action, data);
      await fetchMeetings((currentUser as any)?.id);
    } catch (err: any) {
      console.error(`Failed to ${action} meeting:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#13BE77";
      case "requested":
        return "#EAB308";
      case "rescheduled":
        return "#F59E0B";
      case "declined":
        return "#EF4444";
      case "completed":
        return "#3B82F6";
      case "cancelled":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  const getMeetingTypeDisplay = (type: string) => {
    return t(`schedule_meetings.types.${type}` as any) || type;
  };

  const goToToday = () => {
    setDate(new Date());
  };

  const handleNavigate = (action: 'PREV' | 'NEXT') => {
    let newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() + (action === 'NEXT' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(date.getDate() + (action === 'NEXT' ? 7 : -7));
    } else if (view === 'day') {
      newDate.setDate(date.getDate() + (action === 'NEXT' ? 1 : -1));
    } else if (view === 'agenda') {
      newDate.setMonth(date.getMonth() + (action === 'NEXT' ? 1 : -1));
    }
    setDate(newDate);
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-card backdrop-blur-sm rounded-2xl border border-white/10 text-[#e8eaed] font-sans overflow-hidden">
      {/* Top Navigation Bar - Google Calendar Style */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-transparent flex-shrink-0 min-h-[64px] overflow-x-auto">
        <div className="flex items-center gap-4">


          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary" size={28} />
            <span className="text-[22px] font-normal text-white tracking-wide hidden sm:block">Calendar</span>
          </div>

          <div className="flex items-center ml-2 sm:ml-12 gap-4">
            <button
              onClick={goToToday}
              className="px-4 py-1.5 text-sm font-medium text-[#e8eaed] border border-[#5f6368] rounded hover:bg-white/5 transition-colors hidden sm:block"
            >
              {t('schedule_meetings.today')}
            </button>

            <div className="flex items-center gap-1">
              <button onClick={() => handleNavigate('PREV')} className="p-2 hover:bg-white/10 rounded-full text-[#e8eaed] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => handleNavigate('NEXT')} className="p-2 hover:bg-white/10 rounded-full text-[#e8eaed] transition-colors">
                <ChevronRight size={20} />
              </button>
              <h2 className="text-[22px] font-normal text-[#e8eaed] ml-2 sm:ml-4 min-w-[150px]">
                {format(date, view === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 text-[#e8eaed]">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Search size={20} /></button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><HelpCircle size={20} /></button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Settings size={20} /></button>
          </div>

          <select
            value={view}
            onChange={(e) => setView(e.target.value as View)}
            className="bg-transparent text-[#e8eaed] text-sm font-medium border border-[#5f6368] rounded px-3 py-1.5 hover:bg-white/5 outline-none cursor-pointer"
          >
            <option className="bg-card" value="month">{t('schedule_meetings.month')}</option>
            <option className="bg-card" value="week">{t('schedule_meetings.week')}</option>
            <option className="bg-card" value="day">{t('schedule_meetings.day')}</option>
            <option className="bg-card" value="agenda">{t('schedule_meetings.agenda')}</option>
          </select>

          {currentUser && (
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <span className="text-sm font-bold">{(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-[256px] flex-shrink-0 flex flex-col bg-transparent border-r border-white/10 overflow-y-auto hidden lg:flex">
          <div className="p-4 pl-6">
            <button className="flex items-center gap-3 bg-white text-[#202124] px-4 py-3 rounded-[24px] hover:bg-gray-100 transition-shadow shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] w-auto font-medium mb-8">
              <Plus size={20} className="text-red-500" />
              <span className="pr-2">Create</span>
            </button>

            <h3 className="text-sm font-medium text-[#e8eaed] mb-3 flex items-center gap-2">
              My meetings
            </h3>

            <div className="space-y-1 mt-2">
              {events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setDate(event.start);
                    setSelectedEvent(event);
                    setAiPrepNotes(null);
                  }}
                  className={`p-2 rounded-md cursor-pointer text-sm flex flex-col gap-1 ${selectedEvent?.id === event.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: event.resource.color }} />
                    <span className="truncate flex-1 text-[#e8eaed] font-medium">{event.title}</span>
                  </div>
                  <span className="text-xs text-[#9aa0a6] ml-6">{format(event.start, "MMM d, HH:mm")}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Calendar Grid Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          <div className="flex-1 calendar-wrapper">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={view}
              culture={language}
              onView={(vw: View) => {
                if (vw === "work_week") {
                  setView("week");
                  return;
                }
                setView(vw);
              }}
              date={date}
              onNavigate={(newDate: Date) => setDate(newDate)}
              onSelectEvent={(event: Event) => {
                setSelectedEvent(event);
                setAiPrepNotes(null);
              }}
              selectable
              eventPropGetter={(event: Event) => ({
                style: {
                  backgroundColor: event.resource.color,
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                },
              })}
            />
          </div>

          {/* Floating Selected Event Details (Google Calendar style card) */}
          {selectedEvent && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[448px] max-w-[90vw] bg-card backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden animate-fade-in flex flex-col">

              {/* Card Header with controls */}
              <div className="flex justify-end items-center p-2 bg-transparent">
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#9aa0a6] hover:text-[#e8eaed]">
                  <span className="sr-only">Close</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" focusable="false" className="fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
                </button>
              </div>

              <div className="p-4 pt-0">
                <div className="flex gap-4">
                  <div className="w-4 h-4 rounded-sm mt-1.5 flex-shrink-0" style={{ backgroundColor: selectedEvent.resource.color }} />
                  <div className="flex-1">
                    <h2 className="text-[22px] font-normal text-[#e8eaed] leading-7 mb-1">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-[14px] text-[#e8eaed] mb-6">
                      {format(selectedEvent.start, "EEEE, MMMM d")} ⋅ {format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}
                    </p>

                    <div className="flex items-center gap-4 text-[#e8eaed] mb-4">
                      <Clock size={20} className="text-[#9aa0a6]" />
                      <span className="text-sm">{t(`meetings.${selectedEvent.status === 'confirmed' ? 'confirmed' : selectedEvent.status}` as any) || selectedEvent.status}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[#e8eaed] mb-4">
                      <UserIcon size={20} className="text-[#9aa0a6]" />
                      <span className="text-sm">{selectedEvent.clientName} ({getMeetingTypeDisplay(selectedEvent.meetingType)})</span>
                    </div>

                    {selectedEvent.meetingLink && (
                      <div className="flex items-center gap-4 text-blue-400 mb-4">
                        <MapPin size={20} className="text-blue-400" />
                        {selectedEvent.meetingLink === 'pending-google-workspace' ? (
                          <span className="text-yellow-400 text-sm italic font-medium">
                            Preparing Google Meet Link...
                          </span>
                        ) : (
                          <a 
                            href={selectedEvent.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm hover:underline flex items-center gap-1"
                          >
                            {t('schedule_meetings.join_meeting') || 'Join Meeting'}
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}

                    {aiPrepNotes && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                          <Sparkles size={16} /> AI Preparation Notes
                        </h4>
                        <div className="text-xs text-slate-300 whitespace-pre-wrap">{aiPrepNotes}</div>
                      </div>
                    )}

                    <div className="pt-4 mt-2 flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={handlePrepNotes}
                        disabled={isPrepping}
                        className="text-sm bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isPrepping ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Prepare AI Notes
                      </button>

                      {selectedEvent.status === "requested" && (
                        <>
                          <button
                            onClick={() => {
                              const newDateTime = prompt("Enter new date and time (YYYY-MM-DD HH:MM):");
                              if (newDateTime) {
                                handleMeetingAction(selectedEvent.id, 'reschedule', {
                                  confirmed_datetime: new Date(newDateTime).toISOString()
                                });
                              }
                            }}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-sm hover:bg-white/5 text-[#e8eaed] px-4 py-2 rounded font-medium transition-colors"
                          >
                            {t('schedule_meetings.reschedule')}
                          </button>
                          <button
                            onClick={() => handleMeetingAction(selectedEvent.id, 'confirm')}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-sm bg-[#8ab4f8] hover:bg-[#aecbfa] disabled:opacity-50 text-[#202124] px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
                          >
                            {actionLoading === selectedEvent.id ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            {t('meetings.confirm')}
                          </button>
                        </>
                      )}
                      {selectedEvent.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt("Meeting notes (optional):");
                              handleMeetingAction(selectedEvent.id, 'complete', { notes: notes || '' });
                            }}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-sm bg-[#8ab4f8] hover:bg-[#aecbfa] disabled:opacity-50 text-[#202124] px-4 py-2 rounded font-medium transition-colors"
                          >
                            {t('schedule_meetings.mark_complete')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default page;
