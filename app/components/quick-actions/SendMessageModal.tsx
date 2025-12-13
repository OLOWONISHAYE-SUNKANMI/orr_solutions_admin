"use client";

import { useState, useEffect } from "react";
import { X, Mail, Loader, AlertCircle, CheckCircle, Users } from "lucide-react";
import { ticketAPI, clientAPI } from "@/app/services";
import type { TicketPriority, TicketSource, ClientListItem } from "@/app/services/types";

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendMessageModal({ isOpen, onClose }: SendMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    subject: "",
    description: "",
    priority: "normal" as TicketPriority,
    source: "manual_request" as TicketSource,
    internal_notes: "",
    is_internal: false,
  });

  const priorities = [
    { value: "low", label: "Low", color: "text-blue-400" },
    { value: "normal", label: "Normal", color: "text-green-400" },
    { value: "high", label: "High", color: "text-orange-400" },
    { value: "urgent", label: "Urgent", color: "text-red-400" },
  ];

  const sources = [
    { value: "manual_request", label: "Manual Request" },
    { value: "ai_escalation", label: "AI Escalation" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await clientAPI.listClients() as any;
      const clientsData = Array.isArray(response) ? response : (response.results || response.data || []);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Failed to fetch clients:", err);
      setError("Failed to load clients");
    } finally {
      setClientsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.subject || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ticketData = {
        client: parseInt(formData.client_id),
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        source: formData.source,
      };

      console.log('🎫 Creating ticket with data:', ticketData);
      const ticket = await ticketAPI.createTicket(ticketData);
      console.log('✅ Ticket created successfully:', ticket);
      
      // If there's a message to send, add it to the ticket
      if (!formData.is_internal && formData.description) {
        await ticketAPI.addMessage(ticket.id, formData.description, false);
      }
      
      // Add internal notes if provided
      if (formData.internal_notes) {
        await ticketAPI.addMessage(ticket.id, formData.internal_notes, true);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          client_id: "",
          subject: "",
          description: "",
          priority: "normal" as TicketPriority,
          source: "manual_request" as TicketSource,
          internal_notes: "",
          is_internal: false,
        });
      }, 2000);
    } catch (err: any) {
      console.error("❌ Failed to create ticket:", err);
      let errorMessage = err.message || "Failed to create ticket/message";
      
      // Handle specific error types
      if (errorMessage.includes('duplicate key')) {
        errorMessage = "A ticket with similar information already exists. Please check if this issue was already reported.";
      } else if (errorMessage.includes('validation')) {
        errorMessage = "Please check your input. Some fields may be invalid or missing.";
      } else if (errorMessage.includes('permission')) {
        errorMessage = "You don't have permission to create tickets. Please contact your administrator.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send Message</h2>
              <p className="text-gray-400 text-sm">Create a new ticket or message</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">Error</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-green-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-green-300">Success</p>
                <p className="text-green-200">Message/Ticket created successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Client <span className="text-red-400">*</span>
              </label>
              {clientsLoading ? (
                <div className="flex items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-sm text-gray-400">Loading clients...</span>
                </div>
              ) : (
                <select
                  value={formData.client_id}
                  onChange={(e) => handleInputChange("client_id", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  required
                >
                  <option value="" className="bg-gray-800">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-gray-800">
                      {client.full_name} - {client.company}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Enter message subject"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value} className="bg-gray-800">
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange("source", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {sources.map((source) => (
                    <option key={source.value} value={source.value} className="bg-gray-800">
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter your message here..."
                rows={6}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Internal Notes</label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => handleInputChange("internal_notes", e.target.value)}
                placeholder="Add any internal notes (not visible to client)"
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={formData.is_internal}
                  onChange={(e) => handleInputChange("is_internal", e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                />
                Internal only (not sent to client)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || clientsLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Mail size={16} />
                )}
                {loading ? "Sending..." : "Send Message"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}