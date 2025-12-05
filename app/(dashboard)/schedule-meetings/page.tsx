"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { MoreVertical } from "lucide-react";
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
  const [date, setDate] = useState(new Date(2022, 0, 1)); // January 2022
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  // Sample meeting data with different statuses
  const events = [
    {
      id: 1,
      title: "Festival - First Meeting",
      start: new Date(2022, 0, 4, 10, 0),
      end: new Date(2022, 0, 4, 11, 0),
      status: "New",
      clientName: "John Doe",
      meetingType: "first meeting",
      resource: { color: "bg-green-500" },
    },
    {
      id: 2,
      title: "Exam - Follow-up",
      start: new Date(2022, 0, 4, 14, 0),
      end: new Date(2022, 0, 4, 15, 0),
      status: "Confirmed",
      clientName: "Jane Smith",
      meetingType: "follow-up",
      resource: { color: "bg-blue-500" },
    },
    {
      id: 3,
      title: "Eid Festival - First Meeting",
      start: new Date(2022, 0, 5, 9, 0),
      end: new Date(2022, 0, 5, 10, 0),
      status: "Rescheduled",
      clientName: "Ahmed Hassan",
      meetingType: "first meeting",
      resource: { color: "bg-red-500" },
    },
  ];

  const goToToday = () => {
    setDate(new Date());
  };

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-8 border border-white/10 shadow-2xl">
            <div className="animate-fade-in">
              <h1 className="text-2xl sm:text-4xl font-bold text-white">
                Schedule follow-ups
              </h1>
              <p className="text-gray-400 text-sm mt-2">Manage and track all your meeting requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-6">
              {/* Left Sidebar - Meeting Requests List */}
              <div className="flex flex-col gap-4 max-h-[300px] lg:max-h-[600px] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-white">Follow ups</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to follow up on events
                  </p>
                </div>
                <div className="bg-gradient-to-b from-white/15 to-white/5 h-full p-3 sm:p-4 rounded-xl flex flex-col gap-3 border border-white/10 shadow-lg">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedEvent?.id === event.id
                          ? "bg-primary/20 border border-primary shadow-lg"
                          : "hover:bg-white/15 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-gray-400">
                            {event.meetingType}
                          </p>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <CalendarIcon size={13} className="text-primary" />
                            <span className="hidden sm:inline">{format(event.start, "MMM d, yyyy HH:mm")}</span>
                            <span className="sm:hidden">{format(event.start, "MMM d")}</span>
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
              <div className="bg-gradient-to-br from-white/15 to-white/5 p-4 sm:p-6 rounded-xl flex flex-col border border-white/10 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-white">Schedule Events</h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={goToToday}
                      className="bg-primary hover:bg-primary/80 text-white text-xs px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Today
                    </button>
                    <select
                      value={view}
                      onChange={(e) => setView(e.target.value as View)}
                      className="bg-white/10 hover:bg-white/20 text-xs border border-white/30 rounded-lg px-5 mx-10 sm:px-3 py-2 text-white cursor-pointer transition-all duration-200"
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
                      <MoreVertical size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>

                {/* React Big Calendar */}
                <div className="flex-1 bg-white/5 rounded-lg overflow-x-auto calendar-wrapper border border-white/10 min-h-[350px] sm:min-h-[500px] h-full">
                  <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
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
                      event.status === "New"
                      ? "#3B82F6"
                      : event.status === "Confirmed"
                      ? "#13BE77"
                      : event.status === "Rescheduled"
                      ? "#F59E0B"
                      : event.status === "Declined"
                      ? "#EF4444"
                      : "#6B7280",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    fontSize: "12px",
                    },
                  })}
                  />
                </div>

                {/* Selected Event Details */}
                {selectedEvent && (
                  <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-lg animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">
                          {selectedEvent.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="text-xs bg-primary hover:bg-primary/80 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                        Approve
                      </button>
                      <button className="text-xs bg-blue-500/30 hover:bg-blue-500/40 text-blue-300 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30">
                        Propose Time
                      </button>
                      <button className="text-xs bg-gray-600/30 hover:bg-gray-600/40 text-gray-300 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-600/30">
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
