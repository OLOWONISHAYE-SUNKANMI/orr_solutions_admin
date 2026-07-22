"use client";

import { useState, useEffect } from "react";
import { Search, MessageSquare, AlertCircle, TrendingUp, Eye, Loader, Sparkles } from "lucide-react";
import { aiOversightAPI } from "@/app/services";
import type { AIConversationListItem, AIConversation } from "@/app/services/types";
import { useLanguageStore } from "@/store/languageStore";

const qualityColors: Record<string, string> = {
  good: "bg-green-500/30 text-green-300 border-green-500/30",
  "needs-improvement": "bg-orange-500/30 text-orange-300 border-orange-500/30",
};

export default function AIOversightPage() {
  const { t, language } = useLanguageStore();
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
        setError(t('analytics.error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [filterEscalated, language, t]);

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

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">{t('ai_oversight.title')}</h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">{t('ai_oversight.subtitle')}</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 md:p-6 border border-primary/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs md:text-sm truncate">{t('ai_oversight.total_chats')}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{totalChats}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-4 md:p-6 border border-orange-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs md:text-sm truncate">{t('ai_oversight.escalation_rate')}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{escalationRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl p-4 md:p-6 border border-red-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs md:text-sm truncate">{t('ai_oversight.needs_improvement')}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{needsImprovementCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-4 md:p-6 border border-blue-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs md:text-sm truncate">{t('ai_oversight.escalated')}</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{escalatedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left - Conversation List */}
              <div className="lg:basis-[35%] flex flex-col gap-4">
                {/* Search & Filter */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder={t('ai_oversight.search_placeholder')}
                      className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 text-sm md:text-base"
                    />
                  </div>

                  <select
                    value={filterEscalated}
                    onChange={(e) => setFilterEscalated(e.target.value as "all" | "escalated" | "not-escalated")}
                    className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                  >
                    <option value="all" className="bg-gray-800">{t('ai_oversight.all_chats')}</option>
                    <option value="escalated" className="bg-gray-800">{t('ai_oversight.escalated_only')}</option>
                    <option value="not-escalated" className="bg-gray-800">{t('ai_oversight.not_escalated')}</option>
                  </select>
                </div>

                {/* Conversation List */}
                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg max-h-[400px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="divide-y divide-white/10">
                    {loading ? (
                       <div className="flex items-center justify-center p-8">
                         <Loader className="animate-spin text-primary" size={24} />
                       </div>
                    ) : (
                      filteredChats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className={`w-full p-4 text-left transition-all duration-200 hover:bg-white/10 ${
                            selectedChat?.id === chat.id ? "bg-primary/20 border-l-2 border-primary" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm truncate uppercase tracking-wide">{chat.session_id}</p>
                              <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mt-1">{chat.summary}</p>
                            </div>
                            {chat.escalated_to_ticket && (
                              <span className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-orange-500/30 text-orange-300 border border-orange-500/30 whitespace-nowrap uppercase font-bold">
                                {t('ai_oversight.escalated')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {chat.needs_improvement ? (
                              <span className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-orange-500/30 text-orange-300 border border-orange-500/30 uppercase font-medium">
                                {t('ai_oversight.quality.improvement')}
                              </span>
                            ) : (
                              <span className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-green-500/30 text-green-300 border border-green-500/30 uppercase font-medium">
                                {t('ai_oversight.quality.good')}
                              </span>
                            )}
                            <span className="text-xs text-gray-600 font-bold tracking-widest">•</span>
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {new Date(chat.created_at).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right - Chat Details */}
              <div className="lg:basis-[65%]">
                {selectedChat ? (
                  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-4 md:p-6 flex flex-col gap-6 h-full min-h-[500px]">
                    {/* Header */}
                    <div className="border-b border-white/10 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                          <h2 className="text-xl md:text-2xl font-bold text-white truncate uppercase tracking-tight">{selectedChat.session_id}</h2>
                          <p className="text-gray-400 text-sm mt-1 truncate">{selectedChat.client_name}</p>
                        </div>
                        {selectedChat.escalated_to_ticket && (
                          <div className="flex gap-2">
                            <span className="text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-lg bg-orange-500/30 text-orange-300 border border-orange-500/30 font-bold whitespace-nowrap uppercase">
                              {t('ai_oversight.escalated')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{t('tickets.client')}</p>
                          <p className="text-white font-medium text-xs md:text-sm truncate">{selectedChat.client_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{t('ai_oversight.quality_assessment')}</p>
                          <p className={`font-medium text-xs md:text-sm ${selectedChat.needs_improvement ? 'text-orange-300' : 'text-green-300'}`}>
                            {selectedChat.needs_improvement ? t('ai_oversight.quality.improvement') : t('ai_oversight.quality.good')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{t('dashboard.table_date')}</p>
                          <p className="text-white font-medium text-xs md:text-sm">
                            {new Date(selectedChat.created_at).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{t('ai_oversight.reviewed_by')}</p>
                          <p className="text-white font-medium text-xs md:text-sm truncate">
                            {selectedChat.reviewed_by_name || t('ai_oversight.not_reviewed')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conversation Thread */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">{t('ai_oversight.full_conversation')}</h3>
                        <button
                          onClick={async () => {
                            try {
                              const userMsg = "Please summarize this conversation and evaluate its quality: " + selectedChat.summary;
                              const response = await fetch("http://127.0.0.1:8000/api/v1/ai/document-summary/", {
                                method: "POST",
                                headers: { 
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${localStorage.getItem('access_token')}`
                                },
                                body: JSON.stringify({ text: userMsg })
                              });
                              if (response.ok) {
                                const data = await response.json();
                                alert("AI Analysis: " + (data.summary || data.error || "Completed"));
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded text-[10px] md:text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Sparkles size={12} />
                          Analyze with AI
                        </button>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{t('tickets.client')}</p>
                            <p className="text-sm text-gray-300 mt-1">{selectedChat.summary}</p>
                            <p className="text-[10px] text-gray-500 mt-2 font-mono">
                              {new Date(selectedChat.created_at).toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <div className="flex-1 text-right min-w-0">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('analytics.assistants')}</p>
                            <p className="text-sm text-gray-300 mt-1">Thank you for your question. Based on your query, here's what I found...</p>
                            <p className="text-[10px] text-gray-500 mt-2 font-mono">2 min later</p>
                          </div>
                          <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Quality Flag & Notes */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-white/10 mt-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">
                            {t('ai_oversight.quality_assessment')}
                          </label>
                          <select className="w-full bg-white/10 border border-white/20 px-4 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200">
                            <option className="bg-gray-800" value="good">{t('ai_oversight.quality.good')}</option>
                            <option className="bg-gray-800" value="improvement">{t('ai_oversight.quality.improvement')}</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">
                            {t('ai_oversight.internal_notes')}
                          </label>
                          <textarea
                            placeholder={t('ai_oversight.notes_placeholder')}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none text-sm"
                            rows={2}
                          />
                        </div>
                      </div>

                      <button className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-bold text-xs transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto self-end mt-2 uppercase tracking-widest">
                        {t('ai_oversight.save_assessment')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-8 flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <MessageSquare size={48} className="text-white/10 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm md:text-base uppercase tracking-widest font-bold font-mono animate-pulse">{t('ai_oversight.select_chat')}</p>
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
