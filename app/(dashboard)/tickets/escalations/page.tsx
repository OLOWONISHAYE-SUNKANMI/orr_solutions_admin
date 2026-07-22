"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, User, Loader, Eye } from "lucide-react";
import { ticketAPI } from "@/app/services";
import type { TicketListItem } from "@/app/services/types";
import { useLanguageStore } from "@/store/languageStore";

export default function EscalationsPage() {
  const { t } = useLanguageStore();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEscalatedTickets();
  }, []);

  const fetchEscalatedTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin-portal/v1/tickets/?is_escalated=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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
      console.error("Failed to fetch escalated tickets:", err);
      setError(err.message || "Failed to load escalations");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'normal': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('tickets.escalations_title')}</h1>
            <p className="text-gray-400">{t('tickets.escalations_subtitle')}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <AlertTriangle size={48} className="mx-auto text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('tickets.no_escalations')}</h3>
              <p className="text-gray-400">{t('tickets.no_escalations_desc')}</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-gradient-to-r from-red-500/10 to-orange-500/5 rounded-xl border border-red-500/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="text-red-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">{ticket.ticket_id}</h3>
                        <span className="text-xs px-2 py-1 rounded border bg-purple-500/20 text-purple-300 border-purple-500/30">
                          🤖 {t('tickets.ai_escalated')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                          {t(`tickets.priority_labels.${ticket.priority}`).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{ticket.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{t('tickets.client')}: {ticket.client_name}</span>
                        <span>{t('clients.labels.username')}: {ticket.client_company}</span>
                      </div>
                    </div>
                    <Clock className="text-orange-400" size={24} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">{t('tickets.assigned_to')}</label>
                      <p className="text-sm text-white">{ticket.assigned_to_name || t('tickets.unassigned')}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">{t('tickets.status')}</label>
                      <p className="text-sm text-white">{t(`tickets.status.${ticket.status}`).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-black">
                      Escalated: {new Date(ticket.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400">⚡ {t('tickets.requires_attention')}</span>
                      <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                        <Eye size={14} />
                        {t('common.view')}
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
