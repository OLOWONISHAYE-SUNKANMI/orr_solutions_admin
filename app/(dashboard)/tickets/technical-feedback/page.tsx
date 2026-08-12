"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Monitor,
  Terminal,
  FileCode,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Layout,
  Globe,
  Info,
  Paperclip,
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { feedbackAPI } from "@/app/services/api";

// Types — mirror the backend `TechnicalFeedback` model exactly.
type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";

interface Reporter {
  id: number;
  name: string;
  email: string;
}

interface TechnicalFeedback {
  id: number;
  subject: string;
  description: string;
  status: FeedbackStatus;
  reporter: Reporter | null;
  browserInfo: string;
  osInfo: string;
  urlPath: string;
  attachment: string | null;
  createdAt: string;
}

// Normalize the raw API payload into the shape this page renders.
function mapFeedback(raw: any): TechnicalFeedback {
  return {
    id: raw.id,
    subject: raw.subject ?? "",
    description: raw.description ?? "",
    status: (raw.status as FeedbackStatus) ?? "open",
    reporter: raw.user_details
      ? {
          id: raw.user_details.id,
          name: raw.user_details.name ?? raw.user_details.email ?? "Unknown",
          email: raw.user_details.email ?? "",
        }
      : null,
    browserInfo: raw.browser_info ?? "",
    osInfo: raw.os_info ?? "",
    urlPath: raw.url_path ?? "",
    attachment: raw.attachment ?? null,
    createdAt: raw.created_at ?? "",
  };
}

const statusColors: Record<FeedbackStatus, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<FeedbackStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function TechnicalFeedbackPage() {
  const { language } = useLanguageStore();
  const [allFeedbacks, setAllFeedbacks] = useState<TechnicalFeedback[]>([]);
  const [feedbacks, setFeedbacks] = useState<TechnicalFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<TechnicalFeedback | null>(null);

  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch once — the backend returns every feedback item for admins; filtering
  // and search are applied client-side below.
  useEffect(() => {
    let cancelled = false;
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await feedbackAPI.listFeedback();
        if (cancelled) return;
        const list = Array.isArray(data) ? data.map(mapFeedback) : [];
        setAllFeedbacks(list);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load technical feedback. Please try again.");
        setAllFeedbacks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFeedbacks();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply status filter + search, and keep a sensible selection.
  useEffect(() => {
    let filtered = [...allFeedbacks];
    if (filterStatus !== "all") {
      filtered = filtered.filter((f) => f.status === filterStatus);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.subject.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          String(f.id).includes(query) ||
          (f.reporter?.name.toLowerCase().includes(query) ?? false)
      );
    }
    setFeedbacks(filtered);
    setSelectedFeedback((prev) => {
      if (prev && filtered.some((f) => f.id === prev.id)) return prev;
      return filtered.length > 0 ? filtered[0] : null;
    });
  }, [allFeedbacks, filterStatus, searchQuery]);

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!selectedFeedback) return;
    const id = selectedFeedback.id;
    const prevStatus = selectedFeedback.status;
    if (newStatus === prevStatus) return;

    const applyStatus = (list: TechnicalFeedback[], status: FeedbackStatus) =>
      list.map((f) => (f.id === id ? { ...f, status } : f));

    // Optimistic update, rolled back if the request fails.
    setSelectedFeedback({ ...selectedFeedback, status: newStatus });
    setAllFeedbacks((prev) => applyStatus(prev, newStatus));
    setUpdatingStatus(true);
    try {
      await feedbackAPI.updateStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update feedback status:", err);
      setSelectedFeedback((cur) => (cur && cur.id === id ? { ...cur, status: prevStatus } : cur));
      setAllFeedbacks((prev) => applyStatus(prev, prevStatus));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString() : "—");

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
                <Terminal className="text-primary" size={32} />
                Technical Feedback
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">
                Manage and resolve technical issues reported by clients and staff.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Left - Feedback List */}
            <div className="lg:basis-[35%] flex flex-col gap-4">
              {/* Search & Filters */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search feedback..."
                    className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-200"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[120px]">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | "all")}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                    >
                      <option value="all" className="bg-gray-900">All Status</option>
                      <option value="open" className="bg-gray-900">Open</option>
                      <option value="in_progress" className="bg-gray-900">In Progress</option>
                      <option value="resolved" className="bg-gray-900">Resolved</option>
                      <option value="closed" className="bg-gray-900">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-lg h-[600px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <AlertCircle size={48} className="text-red-500/60 mb-4" />
                    <p className="text-lg font-medium text-white mb-2">Something went wrong</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
                    <p className="text-lg font-medium text-white mb-2">All caught up!</p>
                    <p className="text-sm">No technical feedback matches your criteria.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 p-2 space-y-2">
                    {feedbacks.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedFeedback(item)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 group relative ${
                          selectedFeedback?.id === item.id
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-xs text-gray-400 font-mono">#{item.id}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
                            {statusLabels[item.status]}
                          </span>
                        </div>
                        <h3 className={`font-semibold text-sm mb-2 line-clamp-1 ${selectedFeedback?.id === item.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                          {item.subject}
                        </h3>
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold">
                              {(item.reporter?.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-400">{item.reporter?.name ?? "Unknown"}</span>
                          </div>
                          <span className="text-gray-500">{formatDate(item.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Detail View */}
            <div className="lg:basis-[65%]">
              {selectedFeedback ? (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-lg h-full flex flex-col">
                  {/* Detail Header */}
                  <div className="p-6 md:p-8 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-400 font-mono">#{selectedFeedback.id}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {selectedFeedback.createdAt
                              ? new Date(selectedFeedback.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'it-IT')
                              : "—"}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mt-3">
                          {selectedFeedback.subject}
                        </h2>
                      </div>

                      {/* Status Selector */}
                      <div className="flex flex-col items-end gap-2">
                        <select
                          value={selectedFeedback.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(e.target.value as FeedbackStatus)}
                          className={`appearance-none font-bold text-sm px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-wait ${statusColors[selectedFeedback.status]}`}
                        >
                          <option value="open" className="bg-gray-900 text-white">Status: Open</option>
                          <option value="in_progress" className="bg-gray-900 text-white">Status: In Progress</option>
                          <option value="resolved" className="bg-gray-900 text-white">Status: Resolved</option>
                          <option value="closed" className="bg-gray-900 text-white">Status: Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare size={16} /> Description
                      </h3>
                      <div className="bg-black/20 rounded-xl p-5 border border-white/5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedFeedback.description || "No description provided."}
                      </div>
                    </div>

                    {selectedFeedback.attachment && (
                      <div>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Paperclip size={16} /> Attachment
                        </h3>
                        <a
                          href={selectedFeedback.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline break-all"
                        >
                          <Paperclip size={14} /> View attached file
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Reporter Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info size={16} /> Reporter Info
                        </h3>
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Name</p>
                            <p className="text-sm font-medium text-white">{selectedFeedback.reporter?.name ?? "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-300">{selectedFeedback.reporter?.email || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Technical Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FileCode size={16} /> Technical Context
                        </h3>
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4 font-mono text-sm">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Globe size={14}/> Browser</span>
                            <span className="text-gray-200">{selectedFeedback.browserInfo || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Monitor size={14}/> OS</span>
                            <span className="text-gray-200">{selectedFeedback.osInfo || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-gray-500 flex items-center gap-2"><Layout size={14}/> URL Route</span>
                            <span className="text-primary truncate max-w-[150px]" title={selectedFeedback.urlPath}>
                              {selectedFeedback.urlPath || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-lg h-full flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <Terminal size={64} className="text-white/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Technical Feedback</h3>
                    <p className="text-gray-400">
                      Select an item from the list to view its details, analyze the technical context, and update its status.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      ` }} />
    </div>
  );
}
