"use client";

import { Users, ToggleLeft, ToggleRight, Loader } from "lucide-react";
import type { ClientListItem } from "@/app/services/types";

interface ClientListProps {
  clients: ClientListItem[];
  selectedClientId: number | null;
  loading: boolean;
  onClientSelect: (client: ClientListItem) => void;
}

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

export default function ClientList({ clients, selectedClientId, loading, onClientSelect }: ClientListProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No clients found</p>
        <p className="text-xs mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => (
        <div
          key={client.id}
          onClick={() => onClientSelect(client)}
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedClientId === client.id
              ? "bg-primary/20 border-2 border-primary"
              : "bg-white/5 border border-white/10 hover:bg-white/10"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{client.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{client.email}</p>
              <p className="text-xs text-gray-400 truncate">{client.company}</p>
              {client.role && (
                <p className="text-xs text-gray-500 truncate">{client.role}</p>
              )}
            </div>
            {client.is_portal_active ? (
              <ToggleRight className="text-green-400 flex-shrink-0" size={20} />
            ) : (
              <ToggleLeft className="text-gray-500 flex-shrink-0" size={20} />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${client.stage ? stageColors[client.stage] || "bg-gray-500/30 text-gray-300 border-gray-500/30" : "bg-gray-500/30 text-gray-300 border-gray-500/30"}`}>
              {client.stage ? client.stage.charAt(0).toUpperCase() + client.stage.slice(1) : 'Unknown'}
            </span>
            <span className={`text-xs ${client.primary_pillar ? pillarColors[client.primary_pillar] || "text-gray-400" : "text-gray-400"}`}>
              {client.primary_pillar === "strategic" ? "Strategic" : 
               client.primary_pillar === "operational" ? "Operational" : 
               client.primary_pillar === "financial" ? "Financial" : 
               client.primary_pillar === "cultural" ? "Cultural" : "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last active: {formatDate(client.last_activity || "")}</span>
            {client.assigned_admin_name && (
              <span className="text-gray-400">Admin: {client.assigned_admin_name}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}