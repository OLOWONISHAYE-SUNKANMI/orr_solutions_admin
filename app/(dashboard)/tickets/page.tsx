"use client";

import { ticketAPI } from "@/app/services";
import type { TicketListItem, TicketPriority, TicketSource, TicketStatus } from "@/app/services/types";
import { MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";

const statusColors: Record<TicketStatus, string> = {
  new: "bg-blue-500/30 text-blue-300 border-blue-500/30",
  in_progress: "bg-primary/30 text-primary border-primary/30",
  waiting: "bg-yellow-500/30 text-yellow-300 border-yellow-500/30",
  resolved: "bg-green-500/30 text-green-300 border-green-500/30",
  archived: "bg-gray-500/30 text-gray-300 border-gray-500/30",
};

const priorityColors: Record<TicketPriority, string> = {
  low: "text-gray-400",
  normal: "text-blue-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

const sourceColors: Record<TicketSource, string> = {
  ai_escalation: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  manual_request: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const sourceIcons: Record<TicketSource, React.ReactNode> = {
  ai_escalation: "🤖",
  manual_request: "👤",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketListItem | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
  const [filterSource, setFilterSource] = useState<TicketSource | "all">("all");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketAPI.listTickets({
          status: filterStatus !== "all" ? filterStatus : undefined,
          priority: filterPriority !== "all" ? filterPriority : undefined,
          source: filterSource !== "all" ? filterSource : undefined,
        }) as any;
        // Handle both array response and object with results
        setTickets(Array.isArray(response) ? response : (response.results || []));
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filterStatus, filterPriority, filterSource]);

  const fetchTicketMessages = async (ticketId: number) => {
    try {
      setMessagesLoading(true);
      const messagesData = await ticketAPI.listMessages(ticketId).catch(() => []);
      const messages = Array.isArray(messagesData) ? messagesData : ((messagesData as any)?.results || []);
      setTicketMessages(messages);
    } catch (err) {
      console.error("Failed to fetch ticket messages:", err);
      setTicketMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectTicket = (ticket: TicketListItem) => {
    setSelectedTicket(ticket);
    fetchTicketMessages(ticket.id);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = filterStatus === "all" || ticket.status === filterStatus;
    const priorityMatch = filterPriority === "all" || ticket.priority === filterPriority;
    const sourceMatch = filterSource === "all" || ticket.source === filterSource;
    return statusMatch && priorityMatch && sourceMatch;
  });

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Tickets</h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">Manage and resolve support tickets</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              {/* Left - Ticket List */}
              <div className="lg:basis-[35%] flex flex-col gap-4">
                {/* Search & Filters */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[120px]">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}
                        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="all" className="bg-gray-800">All Status</option>
                        <option value="new" className="bg-gray-800">New</option>
                        <option value="in_progress" className="bg-gray-800">In Progress</option>
                        <option value="waiting" className="bg-gray-800">Waiting</option>
                        <option value="resolved" className="bg-gray-800">Resolved</option>
                        <option value="archived" className="bg-gray-800">Archived</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as TicketPriority | "all")}
                        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="all" className="bg-gray-800">All Priority</option>
                        <option value="low" className="bg-gray-800">Low</option>
                        <option value="normal" className="bg-gray-800">Normal</option>
                        <option value="high" className="bg-gray-800">High</option>
                        <option value="urgent" className="bg-gray-800">Urgent</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value as TicketSource | "all")}
                        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="all" className="bg-gray-800">All Source</option>
                        <option value="ai_escalation" className="bg-gray-800">AI Escalation</option>
                        <option value="manual_request" className="bg-gray-800">Manual Request</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ticket List */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg max-h-[600px] overflow-y-auto">
                  <div className="divide-y divide-white/10">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full p-4 text-left transition-all duration-200 hover:bg-white/10 ${
                          selectedTicket?.id === ticket.id ? "bg-primary/20 border-l-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white text-sm">{ticket.ticket_id}</p>
                              <span className={`text-xs px-2 py-0.5 rounded border ${sourceColors[ticket.source]}`}>
                                {sourceIcons[ticket.source]} {ticket.source.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{ticket.client_name}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded border ${statusColors[ticket.status]}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Ticket Details */}
              {selectedTicket ? (
                <div className="lg:basis-[65%] bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                  {/* Header */}
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">{selectedTicket.ticket_id}</h2>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">{selectedTicket.subject}</p>
                      </div>
                      <span className={`text-xs md:text-sm px-3 py-1 rounded-lg border font-medium ${statusColors[selectedTicket.status]}`}>
                        {selectedTicket.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Client</p>
                        <p className="text-white font-medium">{selectedTicket.client_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Priority</p>
                        <p className={`font-medium ${priorityColors[selectedTicket.priority]}`}>{selectedTicket.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Source</p>
                        <p className="text-white font-medium capitalize">{selectedTicket.source.replace('_', ' ')}</p>
                        <button className="text-primary hover:text-primary/80 text-sm transition-colors">
                          Change
                        </button>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Created</p>
                        <p className="text-white font-medium">{new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned To */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/50 rounded-full" />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{selectedTicket.assigned_to_name}</p>
                      </div>
                      <button className="text-primary hover:text-primary/80 text-sm transition-colors">
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-white">Conversation</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4 max-h-[250px] overflow-y-auto">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">Client message</p>
                          <p className="text-xs text-gray-500 mt-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                          <p className="text-xs text-gray-600 mt-2">Nov 28, 10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 text-right">
                          <p className="text-sm text-primary">Support response</p>
                          <p className="text-xs text-gray-400 mt-1">Thank you for reaching out. We're looking into this.</p>
                          <p className="text-xs text-gray-600 mt-2">Nov 28, 11:15 AM</p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-white">Internal Notes</h3>
                    <textarea
                      placeholder="Add internal notes (visible only to staff)..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <select className="flex-1 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200">
                      <option className="bg-gray-800">Change Status...</option>
                      <option className="bg-gray-800">New</option>
                      <option className="bg-gray-800">In Progress</option>
                      <option className="bg-gray-800">Waiting on Client</option>
                      <option className="bg-gray-800">Resolved</option>
                      <option className="bg-gray-800">Archived</option>
                    </select>
                    <button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="basis-[65%] bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Select a ticket to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
