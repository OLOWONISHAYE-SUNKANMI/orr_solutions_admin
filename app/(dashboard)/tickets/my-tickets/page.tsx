"use client";

import { ticketAPI } from "@/app/services";
import type { TicketListItem, TicketPriority, TicketSource, TicketStatus } from "@/app/services/types";
import { MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";

const statusColors: Record<TicketStatus, string> = {
  new: "bg-blue-500/30 text-blue-300 border-blue-500/30",
  processing: "bg-primary/30 text-primary border-primary/30",
  payment_failed: "bg-red-500/30 text-red-300 border-red-500/30",
  payment_disputed: "bg-orange-500/30 text-orange-300 border-orange-500/30",
  refund_requested: "bg-yellow-500/30 text-yellow-300 border-yellow-500/30",
  refund_processed: "bg-purple-500/30 text-purple-300 border-purple-500/30",
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
  payment_webhook: "bg-green-500/20 text-green-300 border-green-500/30",
  billing_portal: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  subscription_change: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  manual_request: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  client_inquiry: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const sourceIcons: Record<TicketSource, React.ReactNode> = {
  payment_webhook: "💳",
  billing_portal: "🏦",
  subscription_change: "🔄",
  manual_request: "👤",
  client_inquiry: "💬",
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTickets();
  }, [filterStatus, filterPriority, searchQuery]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ticketAPI.getMyTickets() as any;
      let ticketsData = Array.isArray(response) ? response : (response.results || response.data || []);
      
      // Apply client-side filters
      if (filterStatus !== "all") {
        ticketsData = ticketsData.filter((ticket: TicketListItem) => ticket.status === filterStatus);
      }
      if (filterPriority !== "all") {
        ticketsData = ticketsData.filter((ticket: TicketListItem) => ticket.priority === filterPriority);
      }
      if (searchQuery) {
        ticketsData = ticketsData.filter((ticket: TicketListItem) => 
          ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.client_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err: any) {
      console.error("Failed to fetch my tickets:", err);
      setError(err.message || "Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">My Tickets</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">Tickets assigned to you</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <option value="processing" className="bg-gray-800">Processing Payment</option>
                  <option value="payment_failed" className="bg-gray-800">Payment Failed</option>
                  <option value="payment_disputed" className="bg-gray-800">Payment Disputed</option>
                  <option value="refund_requested" className="bg-gray-800">Refund Requested</option>
                  <option value="refund_processed" className="bg-gray-800">Refund Processed</option>
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
            </div>
          </div>

          {/* Tickets Grid */}
          <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tickets assigned to you</p>
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white text-sm">{ticket.ticket_id}</p>
                          <span className={`text-xs px-2 py-0.5 rounded border ${sourceColors[ticket.source]}`}>
                            {sourceIcons[ticket.source]} {ticket.source.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{ticket.client_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">{ticket.subject}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}