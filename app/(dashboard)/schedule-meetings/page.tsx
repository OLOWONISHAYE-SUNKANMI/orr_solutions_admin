"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { MoreVertical, Loader, CheckCircle, Clock, User as UserIcon } from "lucide-react";
import { meetingAPI, authAPI } from "@/app/services";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { Calendar as CalendarIcon } from "lucide-react";

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  clientName: string;
  meetingType: string;
  resource: { color: string };
}

function page() {
  const [date, setDate] = useState(new Date()); // Current date
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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

  const [events, setEvents] = useState<Event[]>([]);

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
        return "bg-green-500";
      case "requested":
        return "bg-yellow-500";
      case "rescheduled":
        return "bg-orange-500";
      case "declined":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getMeetingTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      discovery: "Discovery",
      consultation: "Consultation",
      follow_up: "Follow-up",
      review: "Review"
    };
    return typeMap[type] || type;
  };

  const goToToday = () => {
    setDate(new Date());
  };

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-2 sm:p-4 lg:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-3 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 lg:gap-8 border border-white/10 shadow-2xl">
            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white">
                My Assigned Meetings
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Manage and track meetings assigned to you</p>
              {currentUser && (
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-300">
                  <UserIcon size={14} className="sm:w-4 sm:h-4" />
                  <span className="truncate">Logged in as: {currentUser.full_name || currentUser.username}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col xl:grid xl:grid-cols-[320px_1fr] gap-4 lg:gap-6">
              {/* Left Sidebar - Meeting Requests List */}
              <div className="flex flex-col gap-4 max-h-[280px] xl:max-h-[600px] overflow-y-auto order-2 xl:order-1">
                <div>
                  <h3 className="text-sm font-semibold text-white">My Meetings</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Meetings assigned to you
                  </p>
                </div>
                <div className="bg-gradient-to-b from-white/15 to-white/5 h-full p-3 lg:p-4 rounded-xl flex flex-col gap-3 border border-white/10 shadow-lg">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedEvent?.id === event.id
                          ? "bg-primary/20 border border-primary shadow-lg"
                          : "hover:bg-white/15 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {event.meetingType}
                          </p>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <CalendarIcon size={13} className="text-primary flex-shrink-0" />
                            <span className="hidden lg:inline truncate">{format(event.start, "MMM d, yyyy HH:mm")}</span>
                            <span className="lg:hidden truncate">{format(event.start, "MMM d")}</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${
                            event.status === "requested"
                              ? "bg-yellow-500/30 text-yellow-400"
                              : event.status === "confirmed"
                              ? "bg-green-500/30 text-green-400"
                              : event.status === "rescheduled"
                              ? "bg-orange-500/30 text-orange-400"
                              : event.status === "declined"
                              ? "bg-red-500/30 text-red-400"
                              : event.status === "completed"
                              ? "bg-blue-500/30 text-blue-400"
                              : "bg-gray-500/30 text-gray-400"
                          }`}
                        >
                          {event.status === "confirmed" && <CheckCircle size={12} />}
                          {event.status === "requested" && <Clock size={12} />}
                          <span className="hidden sm:inline">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                          <span className="sm:hidden">{event.status.charAt(0).toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Calendar */}
              <div className="bg-gradient-to-br from-white/15 to-white/5 p-3 lg:p-6 rounded-xl flex flex-col border border-white/10 shadow-lg order-1 xl:order-2">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-3">
                  <h2 className="text-base lg:text-lg font-semibold text-white">Schedule Events</h2>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">
                    <button
                      onClick={goToToday}
                      className="bg-primary hover:bg-primary/80 text-white text-xs px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Today
                    </button>
                    <select
                      value={view}
                      onChange={(e) => setView(e.target.value as View)}
                      className="bg-white/10 hover:bg-white/20 text-xs border border-white/30 rounded-lg px-3 py-2 text-white cursor-pointer transition-all duration-200 flex-1 lg:flex-none min-w-[100px]"
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
                      <MoreVertical size={16} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                  </div>
                </div>

                {/* React Big Calendar */}
                <div className="flex-1 bg-white/5 rounded-lg overflow-hidden calendar-wrapper border border-white/10 min-h-[400px] lg:min-h-[500px] h-full">
                  <div className="w-full h-full overflow-auto">
                    <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%", minHeight: "400px" }}
                    view={view}
                    onView={(vw: View) => {
                      // react-big-calendar may emit views like "work_week"; normalize to "week"
                      if (vw === "work_week") {
                        setView("week");
                        return;
                      }
                      setView(vw);
                    }}
                    date={date}
                    onNavigate={(newDate: Date) => setDate(newDate)}
                    onSelectEvent={setSelectedEvent}
                    popup
                    selectable
                    eventPropGetter={(event: Event) => ({
                      style: {
                      height: "100%",
                      backgroundColor:
                        event.status === "requested"
                        ? "#EAB308"
                        : event.status === "confirmed"
                        ? "#22C55E"
                        : event.status === "rescheduled"
                        ? "#F59E0B"
                        : event.status === "declined"
                        ? "#EF4444"
                        : event.status === "completed"
                        ? "#3B82F6"
                        : "#6B7280",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      fontSize: "12px",
                      },
                    })}
                    />
                  </div>
                </div>

                {/* Selected Event Details */}
                {selectedEvent && (
                  <div className="mt-4 p-3 lg:p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-lg animate-fade-in">
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm lg:text-base truncate">
                          {selectedEvent.title}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-400 mt-1 truncate">
                          Client: {selectedEvent.clientName}
                        </p>
                      </div>
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                          selectedEvent.status === "requested"
                            ? "bg-yellow-500/30 text-yellow-300"
                            : selectedEvent.status === "confirmed"
                            ? "bg-primary/30 text-primary"
                            : selectedEvent.status === "rescheduled"
                            ? "bg-orange-500/30 text-orange-300"
                            : selectedEvent.status === "declined"
                            ? "bg-red-500/30 text-red-300"
                            : "bg-gray-500/30 text-gray-300"
                        }`}
                      >
                        {selectedEvent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-2 mb-4">
                      <p className="break-words">
                        <span className="text-gray-300">Time:</span> {format(selectedEvent.start, "MMM d, yyyy HH:mm")}{" "}
                        - {format(selectedEvent.end, "HH:mm")}
                      </p>
                      <p className="break-words">
                        <span className="text-gray-300">Type:</span> {selectedEvent.meetingType}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {selectedEvent.status === "requested" && (
                        <>
                          <button 
                            onClick={() => handleMeetingAction(selectedEvent.id, 'confirm')}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-xs bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                          >
                            {actionLoading === selectedEvent.id ? <Loader className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                            Confirm
                          </button>
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
                            className="text-xs bg-blue-500/30 hover:bg-blue-500/40 text-blue-300 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt("Reason for declining (optional):");
                              handleMeetingAction(selectedEvent.id, 'decline', { notes: reason || '' });
                            }}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-xs bg-red-500/30 hover:bg-red-500/40 text-red-300 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-red-500/30"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {selectedEvent.status === "confirmed" && (
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
                            className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => {
                              const notes = prompt("Meeting notes (optional):");
                              handleMeetingAction(selectedEvent.id, 'complete', { notes: notes || '' });
                            }}
                            disabled={actionLoading === selectedEvent.id}
                            className="text-xs bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          >
                            Mark Complete
                          </button>
                        </>
                      )}
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
