"use client";

import { useState, useEffect } from "react";
import { Search, MessageSquare, AlertCircle, TrendingUp, Eye, Loader } from "lucide-react";
import { aiOversightAPI } from "@/app/services";
import type { AIConversationListItem, AIConversation } from "@/app/services/types";

const qualityColors: Record<string, string> = {
  good: "bg-green-500/30 text-green-300 border-green-500/30",
  "needs-improvement": "bg-orange-500/30 text-orange-300 border-orange-500/30",
};



export default function AIOversightPage() {
  const [conversations, setConversations] = useState<AIConversationListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<AIConversationListItem | null>(null);
  const [filterEscalated, setFilterEscalated] = useState<"all" | "escalated" | "not-escalated">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await aiOversightAPI.listConversations({
          escalated: filterEscalated !== "all" ? filterEscalated === "escalated" : undefined,
        }) as any;
        // Handle both array response and object with results
        setConversations(Array.isArray(response) ? response : (response.results || []));
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [filterEscalated]);

  const filteredChats = conversations.filter((chat) => {
    if (filterEscalated === "all") return true;
    if (filterEscalated === "escalated") return chat.escalated_to_ticket;
    if (filterEscalated === "not-escalated") return !chat.escalated_to_ticket;
    return true;
  });

  const totalChats = conversations.length;
  const escalatedCount = conversations.filter((c) => c.escalated_to_ticket).length;
  const escalationRate = totalChats > 0 ? ((escalatedCount / totalChats) * 100).toFixed(1) : "0";
  const needsImprovementCount = conversations.filter((c) => c.needs_improvement).length;

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-white">AI & Chat Oversight</h1>
              <p className="text-gray-400 text-sm mt-2">Monitor AI conversations and escalations</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Chats</p>
                    <p className="text-2xl font-bold text-white">{totalChats}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-6 border border-orange-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Escalation Rate</p>
                    <p className="text-2xl font-bold text-white">{escalationRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl p-6 border border-red-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Needs Improvement</p>
                    <p className="text-2xl font-bold text-white">{needsImprovementCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-6 border border-blue-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Escalated</p>
                    <p className="text-2xl font-bold text-white">{escalatedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Left - Conversation List */}
              <div className="basis-[35%] flex flex-col gap-4">
                {/* Search & Filter */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                    />
                  </div>

                  <select
                    value={filterEscalated}
                    onChange={(e) => setFilterEscalated(e.target.value as "all" | "escalated" | "not-escalated")}
                    className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                  >
                    <option value="all" className="bg-gray-800">All Conversations</option>
                    <option value="escalated" className="bg-gray-800">Escalated</option>
                    <option value="not-escalated" className="bg-gray-800">Not Escalated</option>
                  </select>
                </div>

                {/* Conversation List */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg max-h-[600px] overflow-y-auto">
                  <div className="divide-y divide-white/10">
                    {filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full p-4 text-left transition-all duration-200 hover:bg-white/10 ${
                          selectedChat?.id === chat.id ? "bg-primary/20 border-l-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">{chat.session_id}</p>
                            <p className="text-sm text-gray-300 line-clamp-2">{chat.summary}</p>
                          </div>
                          {chat.escalated_to_ticket && (
                            <span className="text-xs px-2 py-1 rounded bg-orange-500/30 text-orange-300 border border-orange-500/30">
                              Escalated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {chat.needs_improvement && (
                            <span className="text-xs px-2 py-1 rounded bg-orange-500/30 text-orange-300 border border-orange-500/30">
                              Needs Improvement
                            </span>
                          )}
                          {!chat.needs_improvement && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/30 text-green-300 border border-green-500/30">
                              Good
                            </span>
                          )}
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Chat Details */}
              {selectedChat ? (
                <div className="basis-[65%] bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6 flex flex-col gap-6">
                  {/* Header */}
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedChat.session_id}</h2>
                        <p className="text-gray-400 text-sm mt-1">{selectedChat.client_name}</p>
                      </div>
                      {selectedChat.escalated_to_ticket && (
                        <div className="flex gap-2">
                          <span className="text-xs px-3 py-1 rounded-lg bg-orange-500/30 text-orange-300 border border-orange-500/30 font-medium">
                            Escalated to Ticket
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Client</p>
                        <p className="text-white font-medium">{selectedChat.client_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quality</p>
                        <p className={`font-medium ${selectedChat.needs_improvement ? 'text-orange-300' : 'text-green-300'}`}>
                          {selectedChat.needs_improvement ? "Needs Improvement" : "Good"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="text-white font-medium">{new Date(selectedChat.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reviewed By</p>
                        <p className="text-white font-medium">{selectedChat.reviewed_by_name || 'Not reviewed'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Thread */}
                  <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-white">Full Conversation</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4 max-h-[300px] overflow-y-auto">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-300">Client</p>
                          <p className="text-sm text-gray-300 mt-1">{selectedChat.summary}</p>
                          <p className="text-xs text-gray-600 mt-2">{new Date(selectedChat.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 text-right">
                          <p className="text-sm font-medium text-primary">AI Assistant</p>
                          <p className="text-sm text-gray-300 mt-1">Thank you for your question. Based on your query, here's what I found...</p>
                          <p className="text-xs text-gray-600 mt-2">2 minutes later</p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Quality Flag & Notes */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Quality Assessment</label>
                      <select className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200">
                        <option className="bg-gray-800">Good</option>
                        <option className="bg-gray-800">Needs Improvement</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Internal Notes</label>
                      <textarea
                        placeholder="Add notes about this conversation..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                        rows={3}
                      />
                    </div>

                    <button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                      Save Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="basis-[65%] bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Select a conversation to view details</p>
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
