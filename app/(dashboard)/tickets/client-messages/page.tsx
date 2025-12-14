"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Send, Loader } from "lucide-react";
import { ticketAPI } from "@/app/services";
import type { TicketListItem } from "@/app/services/types";

export default function ClientMessagesPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientTickets();
  }, []);

  const fetchClientTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/tickets/?source=manual_request', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ticketsData = Array.isArray(data) ? data : (data.results || data.data || []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch client tickets:", err);
      setError(err.message || "Failed to load client messages");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Client Messages</h1>
            <p className="text-gray-400">Direct communication with clients</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Client Messages</h3>
              <p className="text-gray-400">No direct client communication tickets found</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="text-blue-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">{ticket.client_name}</h3>
                        <span className="text-xs px-2 py-1 rounded border bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {ticket.ticket_id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">{ticket.client_company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded border bg-green-500/20 text-green-300 border-green-500/30">
                        {ticket.messages_count} messages
                      </span>
                      <MessageSquare className="text-gray-400" size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        ticket.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' :
                        ticket.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                        <Send size={14} />
                        Reply
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
