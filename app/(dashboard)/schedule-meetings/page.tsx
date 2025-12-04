"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, Views, Navigate } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { CalendarCog, ChevronLeft, ChevronRight, Loader, Search } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { meetingAPI } from "@/app/services";
import type { Meeting } from "@/app/services/types";

// Custom calendar styles
const calendarStyles = `
  .rbc-off-range-bg {
    background-color: var(--color-background) !important;
  }
  .rbc-today {
    background-color: var(--color-card) !important;
  }
  .rbc-date-cell {
    color: #ffffff !important;
  }
  .rbc-header {
    background-color: var(--color-card) !important;
    color: #ffffff !important;
    border-bottom: 1px solid var(--color-secondary) !important;
  }
  .rbc-event {
    color: var(--color-foreground) !important;
  }
  .rbc-button-link {
    color: #ffffff !important;
  }
  .rbc-month-view .rbc-day-bg + .rbc-day-bg {
    color: #ffffff !important;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type EventItem = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  meetingType: string;
  hostName?: string;
  agenda?: string;
  meetingLink?: string;
  internalNotes?: string;
  color?: string;
};

function EventSidebar({ items, onSelectEvent, selectedId }: { items: EventItem[], onSelectEvent: (event: EventItem) => void, selectedId?: number }) {
  return (
    <div className="h-full">
      <div className="bg-card rounded-xl p-4 h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-xl text-white font-semibold mb-1">Meeting Details</h3>
          <p className="text-sm text-white/70">Don't miss scheduled events</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {items.map((it) => (
            <div 
              key={it.id} 
              onClick={() => onSelectEvent(it)}
              className={`bg-background rounded-md p-3 flex gap-3 items-start cursor-pointer transition-all ${
                selectedId === it.id ? 'ring-2 ring-lemon' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{it.title}</h4>
                    <p className="text-xs text-white/70">{it.clientCompany || it.clientEmail}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      it.status === "New" || it.status === "Pending"
                        ? "bg-blue-500/30 text-blue-400"
                        : it.status === "Confirmed"
                        ? "bg-green-500/30 text-green-400"
                        : it.status === "Rescheduled"
                        ? "bg-orange-500/30 text-orange-400"
                        : it.status === "Declined"
                        ? "bg-red-500/30 text-red-400"
                        : "bg-secondary text-white"
                    }`}
                  >
                    {it.status}
                  </span>
                </div>

                <p className="text-xs text-white/70 mt-3 flex gap-2 items-center">
                  <CalendarCog size={14} />
                  {format(it.start, "EEEE, MMM d, yyyy")}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {format(it.start, "h:mm a")} - {format(it.end, "h:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomToolbar({ label, onNavigate, view, onView }: any) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          className="px-3 py-2 rounded bg-secondary hover:bg-lemon hover:text-white text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-lg font-semibold text-white">{label}</div>
        <button
          onClick={() => onNavigate(Navigate.NEXT)}
          className="px-3 py-2 rounded bg-secondary hover:bg-lemon hover:text-white text-white transition-colors">
        
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate(Navigate.TODAY)} 
          className="bg-lemon text-white px-3 py-1 rounded hover:bg-lemon/90 transition-colors"
        >
          Today
        </button>
        <div className="relative inline-block text-left">
          <select
            value={view}
            onChange={(e) => onView(e.target.value)}
            className="bg-card px-3 py-1 rounded text-sm text-white cursor-pointer border border-secondary hover:border-lemon transition-colors"
          >
            <option value={Views.MONTH} className="bg-card text-white">Month</option>
            <option value={Views.WEEK} className="bg-card text-white">Week</option>
            <option value={Views.DAY} className="bg-card text-white">Day</option>
            <option value={Views.AGENDA} className="bg-card text-white">Agenda</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function page() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = calendarStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await meetingAPI.listMeetings() as any;
        // Handle both array response and object with results
        setMeetings(Array.isArray(response) ? response : (response.results || []));
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setError("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Convert meetings to calendar events
  const events: EventItem[] = meetings.map((meeting: Meeting) => ({
    id: meeting.id,
    title: `${meeting.client_name} - ${meeting.meeting_type}`,
    start: new Date(meeting.requested_datetime),
    end: new Date(new Date(meeting.requested_datetime).getTime() + (meeting.duration_minutes || 60) * 60000),
    status: meeting.status,
    clientName: meeting.client_name,
    clientEmail: meeting.client_email,
    clientCompany: meeting.client_company,
    meetingType: meeting.meeting_type,
    hostName: meeting.host_name,
    agenda: meeting.agenda,
    meetingLink: meeting.meeting_link,
    internalNotes: meeting.internal_notes,
    color: "var(--color-secondary)",
  }));

  const eventStyleGetter = (event: EventItem) => {
    const style: React.CSSProperties = {
      backgroundColor: "var(--color-secondary)",
      borderRadius: "4px",
      border: "1px solid var(--color-lemon)",
      padding: "2px 6px",
      color: "var(--color-foreground)",
      fontWeight: 600,
    };
    return { style };
  };

  const handleApprove = async (meetingId: number) => {
    try {
      await meetingAPI.performAction(meetingId, "confirm");
      // Refresh meetings
      const response = await meetingAPI.listMeetings() as any;
      setMeetings(Array.isArray(response) ? response : (response.results || []));
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to approve meeting:", err);
    }
  };

  const handleDecline = async (meetingId: number) => {
    try {
      await meetingAPI.performAction(meetingId, "decline");
      // Refresh meetings
      const response = await meetingAPI.listMeetings() as any;
      setMeetings(Array.isArray(response) ? response : (response.results || []));
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to decline meeting:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-6 sm:p-8 md:p-10 lg:p-14">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Schedule Meetings</h1>
            <p className="text-sm text-white/70 mt-1">Manage and track all your meeting requests</p>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <div className="w-full sm:w-auto max-w-md">
            <div className="relative">
              <input
                placeholder="Search meetings..."
                className="w-full rounded-full py-2 pl-4 pr-10 bg-card text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-lemon"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white" size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <EventSidebar 
              items={events} 
              onSelectEvent={setSelectedEvent}
              selectedId={selectedEvent?.id}
            />
          </aside>

          <main className="flex-1 flex flex-col gap-4">
            <div className="bg-card rounded-xl p-6 flex-1">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.MONTH}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                components={{ toolbar: CustomToolbar }}
                eventPropGetter={(ev: any) => eventStyleGetter(ev as EventItem)}
                onSelectEvent={(event) => setSelectedEvent(event as EventItem)}
                popup
              />
            </div>

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="bg-card rounded-xl p-5 border border-lemon/30 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-1">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      Client: {selectedEvent.clientName}
                    </p>
                    {selectedEvent.clientCompany && (
                      <p className="text-sm text-white/70">
                        Company: {selectedEvent.clientCompany}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      selectedEvent.status === "New" || selectedEvent.status === "Pending"
                        ? "bg-blue-500/30 text-blue-400"
                        : selectedEvent.status === "Confirmed"
                        ? "bg-green-500/30 text-green-400"
                        : selectedEvent.status === "Rescheduled"
                        ? "bg-orange-500/30 text-orange-400"
                        : selectedEvent.status === "Declined"
                        ? "bg-red-500/30 text-red-400"
                        : "bg-secondary text-white"
                    }`}
                  >
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="text-sm text-white/80 space-y-2 mb-4">
                  <p>
                    <span className="text-white font-medium">Time:</span>{" "}
                    {format(selectedEvent.start, "MMM d, yyyy")} at {format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}
                  </p>
                  <p>
                    <span className="text-white font-medium">Type:</span> {selectedEvent.meetingType}
                  </p>
                  <p>
                    <span className="text-white font-medium">Email:</span> {selectedEvent.clientEmail}
                  </p>
                  {selectedEvent.hostName && (
                    <p>
                      <span className="text-white font-medium">Host:</span> {selectedEvent.hostName}
                    </p>
                  )}
                  {selectedEvent.agenda && (
                    <p>
                      <span className="text-white font-medium">Agenda:</span> {selectedEvent.agenda}
                    </p>
                  )}
                  {selectedEvent.meetingLink && (
                    <p>
                      <span className="text-white font-medium">Link:</span>{" "}
                      <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                        Join Meeting
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprove(selectedEvent.id)}
                    className="text-sm bg-lemon hover:bg-lemon/90 text-white px-4 py-2 rounded-lg font-medium transition-all"
                    disabled={selectedEvent.status === "Confirmed"}
                  >
                    Approve
                  </button>
                  <button className="text-sm bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-medium transition-all">
                    Propose Time
                  </button>
                  <button
                    onClick={() => handleDecline(selectedEvent.id)}
                    className="text-sm bg-red-500/30 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg font-medium transition-all border border-red-500/30"
                    disabled={selectedEvent.status === "Declined"}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default page;
