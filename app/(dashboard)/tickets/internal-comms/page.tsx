"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, User, Loader, Eye } from "lucide-react";
import { ticketAPI } from "@/app/services";
import type { TicketListItem } from "@/app/services/types";

export default function InternalCommsPage() {
  const [myTickets, setMyTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/admin-portal/v1/tickets/my-tickets/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ticketsData = Array.isArray(data) ? data : (data.results || data.data || []);
        setMyTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch my tickets:", err);
      setError(err.message || "Failed to load my tickets");
      setMyTickets([]);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">My Assigned Tickets</h1>
            <p className="text-gray-400">Tickets assigned to you for resolution</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : myTickets.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Assigned Tickets</h3>
              <p className="text-gray-400">You have no tickets assigned to you</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="text-primary" size={20} />
                        <h3 className="text-lg font-semibold text-white">{ticket.ticket_id}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${
                          ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                          ticket.priority === 'normal' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{ticket.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Client: {ticket.client_name}</span>
                        <span>Company: {ticket.client_company}</span>
                      </div>
                    </div>
                    <MessageCircle className="text-blue-400" size={24} />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Status</label>
                      <p className={`text-sm font-medium ${
                        ticket.status === 'new' ? 'text-blue-400' :
                        ticket.status === 'in_progress' ? 'text-yellow-400' :
                        ticket.status === 'waiting' ? 'text-orange-400' :
                        ticket.status === 'resolved' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Messages</label>
                      <p className="text-sm text-white">{ticket.messages_count}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Source</label>
                      <p className="text-sm text-white">
                        {ticket.source === 'ai_escalation' ? '🤖 AI Escalation' : '👤 Manual Request'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                      {ticket.updated_at && (
                        <span className="ml-4">Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Eye size={14} />
                      View & Respond
                    </button>
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
