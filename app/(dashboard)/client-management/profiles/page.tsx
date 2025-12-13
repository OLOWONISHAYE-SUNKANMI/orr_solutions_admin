"use client";

import { useState, useEffect } from "react";
import { User, Mail, Building, Calendar, Search, Eye, FileText, Users, Loader } from "lucide-react";
import { clientAPI } from "@/app/services";
import type { ClientListItem, Client } from "@/app/services/types";
import ClientDetailsModal from "@/app/components/client/ClientDetailsModal";

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

export default function ClientProfilesPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: Record<string, any> = {};
      if (searchQuery) filters.search = searchQuery;

      console.log('Fetching clients with filters:', filters);
      const response = await clientAPI.listClients(filters) as any;
      console.log('API response:', response);
      
      const clientsData = Array.isArray(response) ? response : (response.results || response.data || []);
      console.log('Processed clients:', clientsData);
      
      setClients(clientsData);
    } catch (err: any) {
      console.error("Failed to fetch clients:", err);
      setError(err.message || "Failed to load clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id: number) => {
    try {
      setDetailsLoading(true);
      const clientData = await clientAPI.getClient(id) as Client;
      setSelectedClient(clientData);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      setError("Failed to load client details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Client Profiles</h1>
            <p className="text-gray-400">Detailed view of all client profiles</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
              />
            </div>
          </div>

          {/* Client Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
              <p className="text-gray-400">
                {searchQuery ? "Try adjusting your search query" : "No client profiles available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer"
                  onClick={() => fetchClientDetails(client.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{client.full_name}</h3>
                      <p className="text-sm text-gray-400 mb-1">{client.email}</p>
                      <p className="text-sm text-gray-400">{client.company}</p>
                      {client.role && (
                        <p className="text-xs text-gray-500 mt-1">{client.role}</p>
                      )}
                    </div>
                    <User className="text-gray-400" size={24} />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded border ${stageColors[client.stage] || "bg-gray-500/30 text-gray-300 border-gray-500/30"}`}>
                      {client.stage ? client.stage.charAt(0).toUpperCase() + client.stage.slice(1) : 'Unknown'}
                    </span>
                    <span className={`text-xs ${pillarColors[client.primary_pillar] || "text-gray-400"}`}>
                      {client.primary_pillar === "strategic" ? "Strategic" : 
                       client.primary_pillar === "operational" ? "Operational" : 
                       client.primary_pillar === "financial" ? "Financial" : 
                       client.primary_pillar === "cultural" ? "Cultural" : "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Joined: {formatDate(client.created_at)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.is_portal_active 
                        ? "bg-green-500/20 text-green-300" 
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {client.is_portal_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {client.assigned_admin_name && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-500">
                        Admin: <span className="text-gray-400">{client.assigned_admin_name}</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Eye size={14} />
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm mt-6">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Client Details Modal */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClient(null);
        }}
        onUpdate={fetchClients}
      />

      {detailsLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <Loader className="animate-spin text-white" size={32} />
        </div>
      )}
    </div>
  );
}
