"use client";

import { useState } from "react";
import { X, Edit, Eye, Calendar, FileText, ToggleLeft, ToggleRight, Loader, Save, AlertCircle } from "lucide-react";
import { clientService } from "@/app/services/clientService";
import type { Client } from "@/app/services/types";
import ClientDocumentsModal from "./ClientDocumentsModal";

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
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

export default function ClientDetailsModal({ client, isOpen, onClose, onUpdate }: ClientDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Client>>({});
  const [showDocuments, setShowDocuments] = useState(false);

  if (!isOpen || !client) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return "Never";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Never";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Never";
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return "Never";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Never";
      return date.toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Never";
    }
  };

  const getStageDisplay = (stage: string | null | undefined) => {
    if (!stage || stage === 'null' || stage === 'undefined') return 'Unknown';
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  const getPillarDisplay = (pillar: string | null | undefined) => {
    if (!pillar || pillar === 'null' || pillar === 'undefined') return 'Unknown';
    const pillarMap: Record<string, string> = {
      strategic: "Strategic Vision, Planning & Growth",
      operational: "Operational Excellence & Processes",
      financial: "Financial Management & Planning",
      cultural: "Cultural Transformation & People"
    };
    return pillarMap[pillar] || pillar;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      company: client.company,
      role: client.role,
      stage: client.stage,
      primary_pillar: client.primary_pillar,
      internal_notes: client.internal_notes || "",
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await clientService.updateClient(client.id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to update client");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePortal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await clientService.togglePortalAccess(client.id);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to toggle portal access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{client.full_name}</h2>
            <p className="text-gray-400 text-sm">{client.email}</p>
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
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Error</p>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm px-3 py-1 rounded border ${stageColors[client.stage || ''] || "bg-gray-500/30 text-gray-300 border-gray-500/30"}`}>
                Stage: {getStageDisplay(client.stage)}
              </span>
              <span className={`text-sm px-3 py-1 rounded border ${client.is_portal_active ? "bg-green-500/30 text-green-300 border-green-500/30" : "bg-red-500/30 text-red-300 border-red-500/30"}`}>
                Portal: {client.is_portal_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={handleTogglePortal}
                disabled={loading}
                className="text-sm px-3 py-1 rounded border border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : "Toggle Portal Access"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <FileText className="text-blue-400 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">{client.tickets_count}</p>
                <p className="text-xs text-gray-400">Tickets</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Calendar className="text-green-400 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">{client.meetings_count}</p>
                <p className="text-xs text-gray-400">Meetings</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <FileText className="text-purple-400 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">{client.documents_count}</p>
                <p className="text-xs text-gray-400">Documents</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <p className="text-sm font-medium text-white">{client.email}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Username</label>
                  <p className="text-sm font-medium text-white">{client.username}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.company || ""}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                  ) : (
                    <p className="text-sm font-medium text-white">{client.company}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.role || ""}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                      placeholder="Enter role/position"
                    />
                  ) : (
                    <p className="text-sm font-medium text-white">{client.role || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stage</label>
                  {isEditing ? (
                    <select
                      value={editData.stage || client.stage || "discover"}
                      onChange={(e) => setEditData({ ...editData, stage: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="discover">Discover</option>
                      <option value="diagnose">Diagnose</option>
                      <option value="design">Design</option>
                      <option value="deploy">Deploy</option>
                      <option value="grow">Grow</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-white">{getStageDisplay(client.stage)}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Primary Pillar</label>
                  {isEditing ? (
                    <select
                      value={editData.primary_pillar || client.primary_pillar || "strategic"}
                      onChange={(e) => setEditData({ ...editData, primary_pillar: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="strategic">Strategic Vision, Planning & Growth</option>
                      <option value="operational">Operational Excellence & Processes</option>
                      <option value="financial">Financial Management & Planning</option>
                      <option value="cultural">Cultural Transformation & People</option>
                    </select>
                  ) : (
                    <p className={`text-sm font-medium ${pillarColors[client.primary_pillar || ''] || "text-white"}`}>
                      {getPillarDisplay(client.primary_pillar)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {client.assigned_admin_name && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Assigned Admin</label>
                    <p className="text-sm font-medium text-white">{client.assigned_admin_name}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date Joined</label>
                  <p className="text-sm font-medium text-white">{formatDate(client.date_joined || client.created_at)}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Last Login</label>
                  <p className="text-sm font-medium text-white">{formatDateTime(client.last_login)}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Last Activity</label>
                  <p className="text-sm font-medium text-white">{formatDateTime(client.last_activity)}</p>
                </div>

                {client.secondary_pillars && Array.isArray(client.secondary_pillars) && client.secondary_pillars.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Secondary Pillars</label>
                    <div className="flex flex-wrap gap-1">
                      {client.secondary_pillars.map((pillar, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-white/10 rounded border border-white/20 text-gray-300">
                          {getPillarDisplay(pillar)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Internal Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.internal_notes || ""}
                  onChange={(e) => setEditData({ ...editData, internal_notes: e.target.value })}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                  placeholder="Add internal notes..."
                />
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 min-h-[100px]">
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {client.internal_notes && client.internal_notes.trim() ? client.internal_notes : "No internal notes available."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200"
                  >
                    <Edit size={16} />
                    Edit Client
                  </button>
                  <button 
                    onClick={() => setShowDocuments(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
                  >
                    <FileText size={16} />
                    Manage Documents
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200">
                    <Eye size={16} />
                    View Engagement History
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Modal */}
      <ClientDocumentsModal
        clientId={client?.id || null}
        clientName={client?.full_name || ""}
        isOpen={showDocuments}
        onClose={() => setShowDocuments(false)}
      />
    </div>
  );
}