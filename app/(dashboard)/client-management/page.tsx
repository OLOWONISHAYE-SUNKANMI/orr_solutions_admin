"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Users, FileText, Calendar, Eye, Edit, ToggleLeft, ToggleRight, Loader, X } from "lucide-react";
import { clientAPI } from "@/app/services";
import type { ClientListItem, Client } from "@/app/services/types";

const stageColors: Record<string, string> = {
  discover: "bg-blue-500/30 text-blue-300 border-blue-500/30",
  diagnose: "bg-purple-500/30 text-purple-300 border-purple-500/30",
  design: "bg-yellow-500/30 text-yellow-300 border-yellow-500/30",
  deploy: "bg-green-500/30 text-green-300 border-green-500/30",
  grow: "bg-primary/30 text-primary border-primary/30",
};

const pillarColors: Record<string, string> = {
  strategic: "text-blue-400",
  operational: "text-purple-400",
  financial: "text-orange-400",
  cultural: "text-green-400",
};

export default function page() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientEngagement, setClientEngagement] = useState<any>(null);
  const [clientStats, setClientStats] = useState<any>(null);
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterPillar, setFilterPillar] = useState<string>("all");
  const [filterPortalStatus, setFilterPortalStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [filterStage, filterPillar, filterPortalStatus, searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const filters: Record<string, any> = {};
      
      if (filterStage !== "all") filters.stage = filterStage;
      if (filterPillar !== "all") filters.primary_pillar = filterPillar;
      if (filterPortalStatus !== "all") filters.is_portal_active = filterPortalStatus === "active";
      if (searchQuery) filters.search = searchQuery;

      const response = await clientAPI.listClients(filters) as any;
      setClients(Array.isArray(response) ? response : (response.results || []));
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id: number) => {
    try {
      setDetailsLoading(true);
      const [clientData, engagementData] = await Promise.all([
        clientAPI.getClient(id) as Promise<Client>,
        clientAPI.getEngagementHistory(id).catch(() => null),
      ]);
      setSelectedClient(clientData);
      setClientEngagement(engagementData);
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      setError("Failed to load client details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      const stats = await clientAPI.getStats().catch(() => null);
      setClientStats(stats);
    } catch (err) {
      console.error("Failed to fetch client stats:", err);
    }
  };

  const handleTogglePortal = async (clientId: number) => {
    try {
      await clientAPI.performAction(clientId, "toggle_portal");
      fetchClients();
      if (selectedClient && selectedClient.id === clientId) {
        fetchClientDetails(clientId);
      }
    } catch (err) {
      console.error("Failed to toggle portal access:", err);
      setError("Failed to update portal access");
    }
  };

  const handleClientClick = (client: ClientListItem) => {
    fetchClientDetails(client.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Client Management</h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">View and manage client profiles, portal access, and engagement</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              {/* Left - Client List */}
              <div className="lg:basis-[35%] flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, company..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-all duration-200"
                  >
                    <Filter size={16} />
                    Filters
                    {(filterStage !== "all" || filterPillar !== "all" || filterPortalStatus !== "all") && (
                      <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Stage</label>
                        <select
                          value={filterStage}
                          onChange={(e) => setFilterStage(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="all">All Stages</option>
                          <option value="discover">Discover</option>
                          <option value="diagnose">Diagnose</option>
                          <option value="design">Design</option>
                          <option value="deploy">Deploy</option>
                          <option value="grow">Grow</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Primary Pillar</label>
                        <select
                          value={filterPillar}
                          onChange={(e) => setFilterPillar(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="all">All Pillars</option>
                          <option value="strategic">Strategic Vision, Planning & Growth</option>
                          <option value="operational">Operational Excellence & Processes</option>
                          <option value="financial">Financial Management & Planning</option>
                          <option value="cultural">Cultural Transformation & People</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Portal Status</label>
                        <select
                          value={filterPortalStatus}
                          onChange={(e) => setFilterPortalStatus(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setFilterStage("all");
                          setFilterPillar("all");
                          setFilterPortalStatus("all");
                        }}
                        className="text-xs text-primary hover:underline self-end"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg flex-1 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm text-gray-400">
                      {loading ? "Loading..." : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="animate-spin" size={24} />
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No clients found</p>
                      </div>
                    ) : (
                      clients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientClick(client)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedClient?.id === client.id
                              ? "bg-primary/20 border-2 border-primary"
                              : "bg-white/5 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{client.full_name}</p>
                              <p className="text-xs text-gray-400 truncate">{client.company}</p>
                            </div>
                            {client.is_portal_active ? (
                              <ToggleRight className="text-green-400 flex-shrink-0" size={20} />
                            ) : (
                              <ToggleLeft className="text-gray-500 flex-shrink-0" size={20} />
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded border ${stageColors[client.stage] || "bg-gray-500/30 text-gray-300 border-gray-500/30"}`}>
                              {client.stage.charAt(0).toUpperCase() + client.stage.slice(1)}
                            </span>
                            <span className={`text-xs ${pillarColors[client.primary_pillar] || "text-gray-400"}`}>
                              {client.primary_pillar === "strategic" ? "Strategic" : 
                               client.primary_pillar === "operational" ? "Operational" : 
                               client.primary_pillar === "financial" ? "Financial" : "Cultural"}
                            </span>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            Last active: {formatDate(client.last_activity)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right - Client Details */}
              <div className="lg:basis-[65%] bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-4 md:p-6">
                {!selectedClient && !detailsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Users size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">Select a client to view details</p>
                  </div>
                ) : detailsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="animate-spin" size={32} />
                  </div>
                ) : selectedClient ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedClient.full_name}</h2>
                        <p className="text-gray-400 text-sm">{selectedClient.email}</p>
                        <p className="text-gray-400 text-sm">{selectedClient.company}</p>
                        {selectedClient.role && <p className="text-gray-400 text-xs mt-1">{selectedClient.role}</p>}
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-sm px-3 py-1 rounded border ${stageColors[selectedClient.stage] || "bg-gray-500/30 text-gray-300 border-gray-500/30"}`}>
                        Stage: {selectedClient.stage.charAt(0).toUpperCase() + selectedClient.stage.slice(1)}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded border ${selectedClient.is_portal_active ? "bg-green-500/30 text-green-300 border-green-500/30" : "bg-red-500/30 text-red-300 border-red-500/30"}`}>
                        Portal: {selectedClient.is_portal_active ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => handleTogglePortal(selectedClient.id)}
                        className="text-sm px-3 py-1 rounded border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-200"
                      >
                        Toggle Portal Access
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <FileText className="text-blue-400 mb-2" size={20} />
                        <p className="text-2xl font-bold text-white">{selectedClient.tickets_count}</p>
                        <p className="text-xs text-gray-400">Tickets</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <Calendar className="text-green-400 mb-2" size={20} />
                        <p className="text-2xl font-bold text-white">{selectedClient.meetings_count}</p>
                        <p className="text-xs text-gray-400">Meetings</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <FileText className="text-purple-400 mb-2" size={20} />
                        <p className="text-2xl font-bold text-white">{selectedClient.documents_count}</p>
                        <p className="text-xs text-gray-400">Documents</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Primary Pillar</label>
                        <p className={`text-sm font-medium ${pillarColors[selectedClient.primary_pillar] || "text-white"}`}>
                          {selectedClient.primary_pillar === "strategic" ? "Strategic Vision, Planning & Growth" : 
                           selectedClient.primary_pillar === "operational" ? "Operational Excellence & Processes" : 
                           selectedClient.primary_pillar === "financial" ? "Financial Management & Planning" : 
                           "Cultural Transformation & People"}
                        </p>
                      </div>

                      {selectedClient.assigned_admin_name && (
                        <div>
                          <label className="text-xs text-gray-400">Assigned Admin</label>
                          <p className="text-sm font-medium text-white">{selectedClient.assigned_admin_name}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-gray-400">Date Joined</label>
                        <p className="text-sm font-medium text-white">{formatDate(selectedClient.date_joined)}</p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Last Login</label>
                        <p className="text-sm font-medium text-white">{formatDateTime(selectedClient.last_login)}</p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Last Activity</label>
                        <p className="text-sm font-medium text-white">{formatDateTime(selectedClient.last_activity)}</p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400">Username</label>
                        <p className="text-sm font-medium text-white">{selectedClient.username}</p>
                      </div>
                    </div>

                    {selectedClient.internal_notes && (
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block">Internal Notes</label>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <p className="text-sm text-white whitespace-pre-wrap">{selectedClient.internal_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200">
                        <Edit size={16} />
                        Edit Client
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200">
                        <Eye size={16} />
                        View Engagement History
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
