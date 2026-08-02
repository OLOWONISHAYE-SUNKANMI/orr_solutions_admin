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
  Clock,
  Bug,
  Layout,
  Zap,
  Globe,
  Smartphone,
  Info
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

// Types
type FeedbackStatus = 'new' | 'investigating' | 'resolved' | 'closed';
type FeedbackType = 'bug' | 'ui_issue' | 'feature_request' | 'performance';
type UserRole = 'client' | 'project_manager' | 'consultant';

interface TechnicalFeedback {
  id: string;
  subject: string;
  description: string;
  status: FeedbackStatus;
  type: FeedbackType;
  reporter: {
    name: string;
    role: UserRole;
    email: string;
  };
  deviceInfo: {
    browser: string;
    os: string;
    screen: string;
    url: string;
  };
  createdAt: string;
}

// Mock Data
const mockFeedbacks: TechnicalFeedback[] = [
  {
    id: "TF-1042",
    subject: "Dashboard charts not loading on Safari",
    description: "When I try to view the analytics dashboard on my Mac using Safari, the charts spin indefinitely and never load. It works fine on Chrome.",
    status: "new",
    type: "bug",
    reporter: {
      name: "Sarah Jenkins",
      role: "client",
      email: "sarah.j@example.com"
    },
    deviceInfo: {
      browser: "Safari 16.5",
      os: "macOS 13.4",
      screen: "2560x1600",
      url: "/dashboard/analytics"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "TF-1041",
    subject: "Project upload form overlapping on mobile",
    description: "The submit button on the new project request form is overlapping with the file upload dropzone when viewing on a mobile device.",
    status: "investigating",
    type: "ui_issue",
    reporter: {
      name: "Marcus Chen",
      role: "project_manager",
      email: "marcus.c@orrsolutions.com"
    },
    deviceInfo: {
      browser: "Chrome Mobile 114",
      os: "iOS 16.5",
      screen: "390x844",
      url: "/project-requests/new"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "TF-1040",
    subject: "Add dark mode toggle to report viewer",
    description: "It would be great if we could toggle dark mode specifically while viewing large reports, as it's easier on the eyes.",
    status: "new",
    type: "feature_request",
    reporter: {
      name: "Elena Rodriguez",
      role: "consultant",
      email: "elena.r@orrsolutions.com"
    },
    deviceInfo: {
      browser: "Firefox 115",
      os: "Windows 11",
      screen: "1920x1080",
      url: "/consultations/reports/124"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "TF-1039",
    subject: "Slow loading times on Document Vault",
    description: "The document vault is taking over 10 seconds to load the initial folder list when I first log in.",
    status: "resolved",
    type: "performance",
    reporter: {
      name: "David Smith",
      role: "client",
      email: "david.s@corp.net"
    },
    deviceInfo: {
      browser: "Edge 114",
      os: "Windows 10",
      screen: "1920x1080",
      url: "/document-vault/all"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  }
];

const statusColors: Record<FeedbackStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  investigating: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: "New",
  investigating: "Investigating",
  resolved: "Resolved",
  closed: "Closed",
};

const typeIcons: Record<FeedbackType, React.ReactNode> = {
  bug: <Bug size={14} />,
  ui_issue: <Layout size={14} />,
  feature_request: <Zap size={14} />,
  performance: <Clock size={14} />
};

const typeColors: Record<FeedbackType, string> = {
  bug: "text-red-400",
  ui_issue: "text-purple-400",
  feature_request: "text-cyan-400",
  performance: "text-orange-400",
};

const typeLabels: Record<FeedbackType, string> = {
  bug: "Bug",
  ui_issue: "UI Issue",
  feature_request: "Feature",
  performance: "Performance",
};

const roleColors: Record<UserRole, string> = {
  client: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  project_manager: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  consultant: "text-purple-300 bg-purple-500/10 border-purple-500/20",
};

const roleLabels: Record<UserRole, string> = {
  client: "Client",
  project_manager: "Project Manager",
  consultant: "Consultant",
};

export default function TechnicalFeedbackPage() {
  const { language } = useLanguageStore();
  const [feedbacks, setFeedbacks] = useState<TechnicalFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<TechnicalFeedback | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        // In a real scenario, this would be an API call with filters
        // const response = await fetch('/admin-portal/v1/technical-feedback/...)
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
        
        let filtered = [...mockFeedbacks];
        if (filterStatus !== 'all') {
          filtered = filtered.filter(f => f.status === filterStatus);
        }
        if (filterType !== 'all') {
          filtered = filtered.filter(f => f.type === filterType);
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(f => 
            f.subject.toLowerCase().includes(query) || 
            f.description.toLowerCase().includes(query) ||
            f.id.toLowerCase().includes(query) ||
            f.reporter.name.toLowerCase().includes(query)
          );
        }
        
        setFeedbacks(filtered);
        
        // Auto-select first item if none selected and list not empty
        if (filtered.length > 0 && !selectedFeedback) {
          setSelectedFeedback(filtered[0]);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [filterStatus, filterType, searchQuery]);

  const handleStatusChange = (newStatus: FeedbackStatus) => {
    if (!selectedFeedback) return;
    
    // In a real app, this would be an API call
    const updatedFeedback = { ...selectedFeedback, status: newStatus };
    setSelectedFeedback(updatedFeedback);
    
    setFeedbacks(prev => 
      prev.map(f => f.id === updatedFeedback.id ? updatedFeedback : f)
    );
  };

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
                      onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | 'all')}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                    >
                      <option value="all" className="bg-gray-900">All Status</option>
                      <option value="new" className="bg-gray-900">New</option>
                      <option value="investigating" className="bg-gray-900">Investigating</option>
                      <option value="resolved" className="bg-gray-900">Resolved</option>
                      <option value="closed" className="bg-gray-900">Closed</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FeedbackType | 'all')}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200"
                    >
                      <option value="all" className="bg-gray-900">All Types</option>
                      <option value="bug" className="bg-gray-900">Bug</option>
                      <option value="ui_issue" className="bg-gray-900">UI Issue</option>
                      <option value="feature_request" className="bg-gray-900">Feature Request</option>
                      <option value="performance" className="bg-gray-900">Performance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-lg h-[600px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-white/5 ${typeColors[item.type]}`}>
                              {typeIcons[item.type]}
                              {typeLabels[item.type]}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                          </div>
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
                              {item.reporter.name.charAt(0)}
                            </div>
                            <span className="text-gray-400">{item.reporter.name}</span>
                          </div>
                          <span className="text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
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
                          <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-lg bg-white/5 ${typeColors[selectedFeedback.type]}`}>
                            {typeIcons[selectedFeedback.type]}
                            {typeLabels[selectedFeedback.type]}
                          </span>
                          <span className="text-sm text-gray-400 font-mono">{selectedFeedback.id}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {new Date(selectedFeedback.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'it-IT')}
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
                          onChange={(e) => handleStatusChange(e.target.value as FeedbackStatus)}
                          className={`appearance-none font-bold text-sm px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all ${statusColors[selectedFeedback.status]}`}
                        >
                          <option value="new" className="bg-gray-900 text-white">Status: New</option>
                          <option value="investigating" className="bg-gray-900 text-white">Status: Investigating</option>
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
                      <div className="bg-black/20 rounded-xl p-5 border border-white/5 text-gray-300 text-sm leading-relaxed">
                        {selectedFeedback.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Reporter Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info size={16} /> Reporter Info
                        </h3>
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Name</p>
                            <p className="text-sm font-medium text-white">{selectedFeedback.reporter.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Role</p>
                            <span className={`inline-block text-xs px-2.5 py-1 rounded border ${roleColors[selectedFeedback.reporter.role]}`}>
                              {roleLabels[selectedFeedback.reporter.role]}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-300">{selectedFeedback.reporter.email}</p>
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
                            <span className="text-gray-200">{selectedFeedback.deviceInfo.browser}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Monitor size={14}/> OS</span>
                            <span className="text-gray-200">{selectedFeedback.deviceInfo.os}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Smartphone size={14}/> Screen</span>
                            <span className="text-gray-200">{selectedFeedback.deviceInfo.screen}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-gray-500 flex items-center gap-2"><Layout size={14}/> URL Route</span>
                            <span className="text-primary truncate max-w-[150px]" title={selectedFeedback.deviceInfo.url}>
                              {selectedFeedback.deviceInfo.url}
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
      
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  );
}
