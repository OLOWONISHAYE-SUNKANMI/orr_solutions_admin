"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

interface TicketMessage {
  id: number;
  message: string;
  sender_name: string;
  sender_type: string;
  created_at: string;
  is_internal: boolean;
}

interface Ticket {
  id: number;
  ticket_id: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
  client_name: string;
  client_company: string;
  messages_count?: number;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
  ticket?: Ticket;
}

export default function MessagesPage() {
  const { t, language } = useLanguageStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [seenCounts, setSeenCounts] = useState<Record<number, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedChatRef = useRef(selectedChat);
  const seenCountsRef = useRef(seenCounts);
  
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    seenCountsRef.current = seenCounts;
  });

  const scrollToBottom = (force = false) => {
    if (force || !scrollContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const container = scrollContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("seenAdminMessages");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSeenCounts(parsed);
      seenCountsRef.current = parsed;
    }
  }, []);

  useEffect(() => {
    fetchTickets(true);

    // Refresh ticket list every 10 seconds
    const ticketInterval = setInterval(() => fetchTickets(false), 10000);
    return () => clearInterval(ticketInterval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Fetch messages immediately when chat changes
      fetchMessages(selectedChat.id);
      
      // Force initial scroll
      setTimeout(() => scrollToBottom(true), 100);

      // Poll for new messages every 2 seconds
      const messageInterval = setInterval(() => {
        fetchMessages(selectedChat.id);
      }, 2000);

      return () => clearInterval(messageInterval);
    }
  }, [selectedChat]);

  const fetchTickets = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }

      console.log("Using token:", token ? "Token exists" : "No token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/tickets/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Messages API Response:", data);

        // Handle different response formats
        let ticketsArray = [];
        if (Array.isArray(data)) {
          ticketsArray = data;
        } else if (data && Array.isArray(data.data)) {
          ticketsArray = data.data;
        } else if (data && Array.isArray(data.results)) {
          ticketsArray = data.results;
        } else if (data && Array.isArray(data.tickets)) {
          ticketsArray = data.tickets;
        } else if (data && data.data && typeof data.data === "object") {
          // Handle case where data.data is an object with tickets property
          if (Array.isArray(data.data.tickets)) {
            ticketsArray = data.data.tickets;
          } else if (Array.isArray(data.data.results)) {
            ticketsArray = data.data.results;
          } else {
            // Convert single object to array or handle pagination
            ticketsArray = Object.values(data.data).filter(
              (item: any) => item && typeof item === "object" && item.id,
            );
          }
        } else {
          console.error("Unexpected response format:", data);
          setLoading(false);
          return;
        }

        // Convert tickets to chat format
        const sortedTickets = [...ticketsArray].sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at).getTime();
          const timeB = new Date(b.last_message_at || b.created_at).getTime();
          return timeB - timeA;
        });

        const ticketChats: Chat[] = sortedTickets.map((ticket: any) => {
          const totalMessages = ticket.messages_count || 0;
          const seen = seenCountsRef.current[ticket.id] || 0;
          const unread = Math.max(0, totalMessages - seen);

          return {
            id: ticket.id,
            name: ticket.client_name ? `${t('tickets.support_prefix')} - ${ticket.client_name}` : `${t('tickets.support_prefix')} - ${ticket.ticket_id}`,
            lastMessage: ticket.subject || t('tickets.no_subject'),
            timestamp: new Date(ticket.last_message_at || ticket.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT'),
            unread: unread,
            avatar: "🎧",
            online: ticket.status !== "resolved",
            ticket,
          };
        });

        setChats(ticketChats);
        if (ticketChats.length > 0 && !selectedChatRef.current) {
          setSelectedChat(ticketChats[0]);
          fetchMessages(ticketChats[0].id);
        }
      } else {
        console.error(
          "Failed to fetch tickets:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      console.log("Fetching messages for ticket ID:", ticketId);

      if (!ticketId || ticketId === undefined) {
        console.error("Invalid ticket ID:", ticketId);
        return;
      }

      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No authentication token found for messages");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/tickets/${ticketId}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        // Normalize different API response shapes into an array
        let messagesArray: TicketMessage[] = [];
        if (Array.isArray(result)) {
          messagesArray = result;
        } else if (result && Array.isArray(result.data)) {
          messagesArray = result.data;
        } else if (result && Array.isArray(result.results)) {
          messagesArray = result.results;
        } else if (result && result.data && typeof result.data === "object") {
          messagesArray = (Object.values(result.data) as TicketMessage[]).filter(
              (item) => item && item.id,
            );
        } else {
          messagesArray = [];
        }

        setMessages(messagesArray);

        // Update seen count if we have more messages now (whatsapp style)
        if (messagesArray.length > (seenCountsRef.current[ticketId] || 0)) {
          const newSeen = { ...seenCountsRef.current, [ticketId]: messagesArray.length };
          setSeenCounts(newSeen);
          seenCountsRef.current = newSeen;
          localStorage.setItem("seenAdminMessages", JSON.stringify(newSeen));
        }
      } else {
        console.error(
          "Failed to fetch messages:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.error("No authentication token found for sending message");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/tickets/${selectedChat.id}/messages/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: newMessage, is_internal: false }),
          },
        );

        if (response.ok) {
          setNewMessage("");
          // Refresh messages and force scroll
          await fetchMessages(selectedChat.id);
          scrollToBottom(true);
          // Refresh ticket list to update last activity and move it to top
          fetchTickets(false);
        } else {
          console.error(
            "Failed to send message:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'en' ? "en-US" : "it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const hasAutoReply =
    Array.isArray(messages) &&
    messages.some(
      (msg) =>
        msg &&
        (msg.sender_type === "system" ||
          (msg.sender_name && msg.sender_name.includes("Auto Reply"))),
    );

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-foreground animate-pulse">{t('tickets.loading_messages')}</div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full bg-background flex overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-card border-r border-white/10 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {t('tickets.support_messages')}
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground opacity-40 w-4 h-4" />
            <input
              type="text"
              placeholder={t('tickets.search_conversations')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-white/10 rounded-lg text-foreground placeholder:opacity-60 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-foreground/60">
              {t('tickets.no_tickets_found')}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  if (chat.unread > 0) {
                    const newSeen = { ...seenCountsRef.current, [chat.id]: chat.ticket?.messages_count || 0 };
                    setSeenCounts(newSeen);
                    seenCountsRef.current = newSeen;
                    localStorage.setItem("seenAdminMessages", JSON.stringify(newSeen));
                  }
                }}
                className={`p-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                  selectedChat?.id === chat.id
                    ? "bg-primary/10 border-l-4 border-l-primary shadow-inner"
                    : "hover:bg-secondary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                      {chat.avatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col min-w-0">
                        {chat.ticket?.ticket_id && (
                          <span className="text-[10px] text-primary font-mono leading-none mb-1">
                            {chat.ticket.ticket_id}
                          </span>
                        )}
                        <h3 className={`font-sm font-medium truncate ${selectedChat?.id === chat.id ? "text-primary" : "text-foreground"}`}>
                          {chat.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-foreground opacity-60">
                          {chat.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {chat.unread > 0 && (
                            <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {chat.unread}
                            </span>
                          )}
                          <span className="text-[9px] text-foreground opacity-40 bg-white/5 px-1 rounded">
                            {chat.ticket?.messages_count || 0} {t('consultations.reports_plural').toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${selectedChat?.id === chat.id ? "text-foreground" : "text-foreground/70"}`}>
                        {chat.lastMessage}
                      </p>
                      {chat.ticket?.status && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            chat.ticket.status === "resolved"
                              ? "bg-green-500/20 text-green-300"
                              : chat.ticket.status === "new"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {chat.ticket.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-card border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  {selectedChat.ticket?.ticket_id && (
                    <p className="text-[10px] text-primary font-mono leading-none mb-1">
                      {selectedChat.ticket.ticket_id}
                    </p>
                  )}
                  <h2 className="font-semibold text-foreground">
                    {selectedChat.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-foreground opacity-60">
                      {selectedChat.online ? t('tickets.active') : t('tickets.resolved')}
                    </p>
                    {hasAutoReply && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 flex items-center gap-1">
                        <CheckCircle size={10} />
                        {t('tickets.auto_replied')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                </button>
                <button className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors">
                  <Video className="w-5 h-5 text-foreground" />
                </button>
                <button className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors">
                  <MoreVertical className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages
                .filter(msg => 
                  msg.sender_type !== "system" && 
                  !(msg.sender_name && msg.sender_name.includes("Auto Reply"))
                )
                .map((message) => {
                const isUs = message.sender_type === "admin" || message.sender_type === "support";
                const isInternal = message.is_internal;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUs ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col ${isUs ? "items-end" : "items-start"} max-w-[80%]`}>
                      <span className="text-[10px] font-bold text-foreground/50 mb-1 px-1 uppercase tracking-wider">
                        {isInternal ? `🔒 ${t('tickets.internal_note')}` : `${message.sender_name} • ${isUs ? t('tickets.you') : t('tickets.client_label')}`}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isInternal
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-sm"
                            : isUs
                              ? "bg-primary text-black rounded-tr-none font-medium shadow-md"
                              : "bg-blue-500/15 text-blue-50 border border-blue-500/30 rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p
                            className={`text-[10px] ${
                              isUs ? "text-black/60" : "text-foreground/40"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-card border-t border-white/10">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors">
                  <Paperclip className="w-5 h-5 text-foreground" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={t('tickets.type_message_admin')}
                    className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg text-foreground placeholder:opacity-60 focus:border-primary outline-none pr-12"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary/60 transition-colors">
                    <Smile className="w-5 h-5 text-foreground opacity-60" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-foreground/60">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-40" />
              <p>{t('tickets.select_conversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
