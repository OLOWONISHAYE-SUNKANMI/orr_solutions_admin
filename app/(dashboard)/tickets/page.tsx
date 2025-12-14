"use client";

import { ticketAPI } from "@/app/services";
import type { TicketListItem, TicketPriority, TicketSource, TicketStatus } from "@/app/services/types";
import { MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationContext } from "@/lib/contexts/NotificationContext";

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketListItem | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
  const [filterSource, setFilterSource] = useState<TicketSource | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [newAssignedTo, setNewAssignedTo] = useState<number | "">("");
  const { success, error: showError } = useNotificationContext();

  useEffect(() => {
    fetchTickets();
    fetchAssignableUsers();
  }, [filterStatus, filterPriority, filterSource, searchQuery]);

  const fetchAssignableUsers = async () => {
    try {
      const users = await ticketAPI.getAssignableUsers() as any;
      const usersData = Array.isArray(users) ? users : (users.results || users.data || []);
      setAssignableUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      console.error("Failed to fetch assignable users:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterPriority !== "all") filters.priority = filterPriority;
      if (filterSource !== "all") filters.source = filterSource;
      if (searchQuery) filters.search = searchQuery;

      const response = await ticketAPI.listTickets(filters) as any;
      const ticketsData = Array.isArray(response) ? response : (response.results || response.data || []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err: any) {
      console.error("Failed to fetch tickets:", err);
      setError(err.message || "Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: number) => {
    try {
      setMessagesLoading(true);
      
      const response = await fetch(`http://127.0.0.1:8002/admin-portal/v1/tickets/${ticketId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const messagesData = await response.json();
        const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.results || messagesData?.data || []);
        setTicketMessages(Array.isArray(messages) ? messages : []);
      } else {
        setTicketMessages([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch ticket messages:", err);
      setTicketMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectTicket = (ticket: TicketListItem) => {
    setSelectedTicket(ticket);
    setNewAssignedTo("");
    fetchTicketMessages(ticket.id);
  };

  const handleAssignmentChange = async () => {
    if (!selectedTicket || !newAssignedTo) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      await ticketAPI.partialUpdateTicket(selectedTicket.id, { assigned_to: newAssignedTo });
      
      const assignedUser = assignableUsers.find(u => u.id === newAssignedTo);
      const userName = assignedUser?.full_name || assignedUser?.username || 'Unknown User';
      
      success('Ticket Assigned', `Ticket ${selectedTicket.ticket_id} has been assigned to ${userName}`);
      
      setNewAssignedTo("");
      fetchTickets();
      if (selectedTicket) {
        const updatedTicket = { ...selectedTicket, assigned_to_name: userName };
        setSelectedTicket(updatedTicket);
      }
    } catch (err: any) {
      console.error("Failed to update ticket assignment:", err);
      showError('Assignment Failed', err.message || "Failed to update assignment");
      setError(err.message || "Failed to update assignment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedTicket || !newStatus) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setError(null);
      
      // Use direct PATCH update instead of actions
      const response = await fetch(`http://127.0.0.1:8002/admin-portal/v1/tickets/${selectedTicket.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setNewStatus("");
      fetchTickets();
      if (selectedTicket) {
        const updatedTicket = { ...selectedTicket, status: newStatus };
        setSelectedTicket(updatedTicket);
      }
    } catch (err: any) {
      console.error("Failed to update ticket status:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      // Use direct POST to messages endpoint
      const response = await fetch(`http://127.0.0.1:8002/admin-portal/v1/tickets/${selectedTicket.id}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ 
          message: newMessage,
          is_internal: isInternal 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      setNewMessage("");
      setIsInternal(false);
      fetchTicketMessages(selectedTicket.id);
    } catch (err: any) {
      console.error("Failed to add message:", err);
      setError(err.message || "Failed to add message");
    } finally {
      setActionLoading(false);
    }
  };



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
                    <div className="flex-1 min-w-[120px]">
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value as TicketSource | "all")}
                        className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                      >
                        <option value="all" className="bg-gray-800">All Source</option>
                        <option value="payment_webhook" className="bg-gray-800">Payment Webhook</option>
                        <option value="billing_portal" className="bg-gray-800">Billing Portal</option>
                        <option value="subscription_change" className="bg-gray-800">Subscription Change</option>
                        <option value="manual_request" className="bg-gray-800">Manual Request</option>
                        <option value="client_inquiry" className="bg-gray-800">Client Inquiry</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ticket List */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tickets found</p>
                      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
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
                  )}
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
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {selectedTicket.assigned_to_name ? 
                            selectedTicket.assigned_to_name.trim().split(' ').filter(n => n.length > 0).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'UN'
                            : 'UN'
                          }
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{selectedTicket.assigned_to_name || 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={newAssignedTo}
                          onChange={(e) => setNewAssignedTo(e.target.value ? parseInt(e.target.value) : "")}
                          className="bg-white/10 border border-white/20 px-2 py-1 rounded text-xs text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="" className="bg-gray-800">Change assignee...</option>
                          {assignableUsers.map((user) => (
                            <option key={user.id} value={user.id} className="bg-gray-800">
                              {user.full_name || user.username}
                            </option>
                          ))}
                        </select>
                        {newAssignedTo && (
                          <button 
                            onClick={handleAssignmentChange}
                            disabled={actionLoading}
                            className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-2 py-1 rounded text-xs transition-all duration-200"
                          >
                            {actionLoading ? 'Updating...' : 'Assign'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-white">Conversation</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4 max-h-[250px] overflow-y-auto">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : ticketMessages.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          <p className="text-sm">No messages yet</p>
                        </div>
                      ) : (
                        ticketMessages.map((message, index) => {
                          const getInitials = (name: string) => {
                            if (!name || typeof name !== 'string' || name.trim() === '') {
                              return 'U';
                            }
                            const words = name.trim().split(' ').filter(word => word.length > 0);
                            if (words.length === 0) return 'U';
                            if (words.length === 1) return words[0][0].toUpperCase();
                            return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
                          };
                          
                          return (
                          <div key={index} className={`flex gap-3 ${message.sender_type === 'admin' ? 'justify-end' : ''}`}>
                            {message.sender_type !== 'admin' && (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">{getInitials(message.sender_name)}</span>
                              </div>
                            )}
                            <div className={message.sender_type === 'admin' ? 'flex-1 text-right' : ''}>
                              <p className={`text-sm ${message.sender_type === 'admin' ? 'text-primary' : 'text-gray-300'}`}>
                                {message.sender_name || 'Unknown User'} {message.is_internal && '(Internal)'}
                              </p>
                              <p className="text-xs text-gray-200 mt-1">{message.message}</p>
                              <p className="text-xs text-gray-100 mt-2">
                                {new Date(message.created_at).toLocaleString()}
                              </p>
                            </div>
                            {message.sender_type === 'admin' && (
                              <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">{getInitials(message.sender_name)}</span>
                              </div>
                            )}
                          </div>
                        );
                        })
                      )}
                    </div>
                    
                    {/* Add Message */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                        />
                        <label htmlFor="internal" className="text-sm text-gray-400">Internal message</label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
                        />
                        <button
                          onClick={handleAddMessage}
                          disabled={!newMessage.trim() || actionLoading}
                          className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                          Send
                        </button>
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
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                      className="flex-1 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                    >
                      <option value="" className="bg-gray-800">Change Status...</option>
                      <option value="new" className="bg-gray-800">New</option>
                      <option value="processing" className="bg-gray-800">Processing Payment</option>
                      <option value="payment_failed" className="bg-gray-800">Payment Failed</option>
                      <option value="payment_disputed" className="bg-gray-800">Payment Disputed</option>
                      <option value="refund_requested" className="bg-gray-800">Refund Requested</option>
                      <option value="refund_processed" className="bg-gray-800">Refund Processed</option>
                      <option value="resolved" className="bg-gray-800">Resolved</option>
                      <option value="archived" className="bg-gray-800">Archived</option>
                    </select>
                    <button 
                      onClick={handleStatusChange}
                      disabled={!newStatus || actionLoading}
                      className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {actionLoading ? 'Updating...' : 'Update Status'}
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
