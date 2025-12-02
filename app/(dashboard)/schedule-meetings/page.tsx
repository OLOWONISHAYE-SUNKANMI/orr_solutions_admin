"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { MoreVertical, Loader } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { meetingAPI } from "@/app/services";
import type { Meeting } from "@/app/services/types";

function page() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locales = {
    "en-US": enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

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
  const events = meetings.map((meeting: Meeting) => ({
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
    resource: { color: "bg-green-500" },
  }));

  const goToToday = () => {
    setDate(new Date());
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
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold text-white">
                Schedule follow-ups
              </h1>
              <p className="text-gray-400 text-sm mt-2">Manage and track all your meeting requests</p>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex gap-6">
              {/* Left Sidebar - Meeting Requests List */}
              <div className="flex h-[100vh] flex-col gap-4 basis-[28%] max-h-[600px] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-white">Follow ups</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to follow up on events
                  </p>
                </div>
                <div className="bg-gradient-to-b from-white/15 to-white/5 h-full p-4 rounded-xl flex flex-col gap-3 border border-white/10 shadow-lg">
                  {events.map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedEvent?.id === event.id
                          ? "bg-primary/20 border border-primary shadow-lg"
                          : "hover:bg-white/15 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-gray-400">
                            {event.meetingType}
                          </p>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <CalendarIcon size={13} className="text-primary" />
                            {format(event.start, "MMM d, yyyy HH:mm")}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                            event.status === "New"
                              ? "bg-blue-500/30 text-blue-500"
                              : event.status === "Confirmed"
                              ? "bg-green-500/30 text-green-500"
                              : event.status === "Rescheduled"
                              ? "bg-orange-500/30 text-orange-500"
                              : event.status === "Declined"
                              ? "bg-red-500/30 text-red-500"
                              : "bg-gray-500/30 text-gray-500"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Calendar */}
              <div className="basis-[72%] bg-gradient-to-br from-white/15 to-white/5 p-6 rounded-xl flex flex-col border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Schedule Events</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToToday}
                      className="bg-primary hover:bg-primary/80 text-white text-xs px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Today
                    </button>
                    <select
                      value={view}
                      onChange={(e) => setView(e.target.value as any)}
                      className="bg-white/10 hover:bg-white/20 text-xs border border-white/30 rounded-lg px-3 py-2 text-white cursor-pointer transition-all duration-200"
                    >
                      <option className="bg-gray-800" value="month">
                        Month
                      </option>
                      <option className="bg-gray-800" value="week">
                        Week
                      </option>
                      <option className="bg-gray-800" value="day">
                        Day
                      </option>
                      <option className="bg-gray-800" value="agenda">
                        Agenda
                      </option>
                    </select>
                    <button className="text-gray-400 hover:text-primary transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* React Big Calendar */}
                <div className="flex-1 bg-white/5 rounded-lg overflow-hidden calendar-wrapper border border-white/10">
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    onSelectEvent={setSelectedEvent}
                    popup
                    selectable
                  />
                </div>

                {/* Selected Event Details */}
                {selectedEvent && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-lg animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white text-base">
                          {selectedEvent.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Client: {selectedEvent.clientName}
                        </p>
                      </div>
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-full font-medium ${
                          selectedEvent.status === "New"
                            ? "bg-blue-500/30 text-blue-300"
                            : selectedEvent.status === "Confirmed"
                            ? "bg-primary/30 text-primary"
                            : selectedEvent.status === "Rescheduled"
                            ? "bg-orange-500/30 text-orange-300"
                            : selectedEvent.status === "Declined"
                            ? "bg-red-500/30 text-red-300"
                            : "bg-gray-500/30 text-gray-300"
                        }`}
                      >
                        {selectedEvent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-2 mb-4">
                      <p>
                        <span className="text-gray-300">Time:</span> {format(selectedEvent.start, "MMM d, yyyy HH:mm")}{" "}
                        - {format(selectedEvent.end, "HH:mm")}
                      </p>
                      <p>
                        <span className="text-gray-300">Type:</span> {selectedEvent.meetingType}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(selectedEvent.id)}
                        className="text-xs bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                        Approve
                      </button>
                      <button className="text-xs bg-blue-500/30 hover:bg-blue-500/40 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30">
                        Propose Time
                      </button>
                      <button 
                        onClick={() => handleDecline(selectedEvent.id)}
                        className="text-xs bg-gray-600/30 hover:bg-gray-600/40 text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-600/30">
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
