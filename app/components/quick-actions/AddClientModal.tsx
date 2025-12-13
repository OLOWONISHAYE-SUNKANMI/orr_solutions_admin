"use client";

import { useState } from "react";
import { X, UserPlus, Loader, AlertCircle, CheckCircle } from "lucide-react";
import { clientAPI } from "@/app/services";
import { createClientSafely, formatClientError } from "@/app/services/clientUtils";
import type { ClientStage, Pillar } from "@/app/services/types";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    company: "",
    role: "",
    stage: "discover" as ClientStage,
    primary_pillar: "strategic" as Pillar,
    secondary_pillars: "",
    internal_notes: "",
    is_portal_active: true,
  });

  const stages = [
    { value: "discover", label: "Discover" },
    { value: "diagnose", label: "Diagnose" },
    { value: "design", label: "Design" },
    { value: "deploy", label: "Deploy" },
    { value: "grow", label: "Grow" },
  ];

  const pillars = [
    { value: "strategic", label: "Strategic Vision, Planning & Growth" },
    { value: "operational", label: "Operational Excellence & Processes" },
    { value: "financial", label: "Financial Management & Planning" },
    { value: "cultural", label: "Cultural Transformation & People" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.company) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await createClientSafely(formData);
      console.log('✅ Client created successfully:', result);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          full_name: "",
          email: "",
          username: "",
          company: "",
          role: "",
          stage: "discover" as ClientStage,
          primary_pillar: "strategic" as Pillar,
          secondary_pillars: "",
          internal_notes: "",
          is_portal_active: true,
        });
      }, 2000);
    } catch (err: any) {
      console.error("Failed to create client:", err);
      const userFriendlyError = formatClientError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Client</h2>
              <p className="text-gray-400 text-sm">Create a new client profile</p>
            </div>
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
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">Error</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-green-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-green-300">Success</p>
                <p className="text-green-200">Client created successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Auto-generated from email"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Company <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Enter company name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Role/Position</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder="e.g., CEO, CTO, Manager"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange("stage", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value} className="bg-gray-800">
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Primary Pillar</label>
                <select
                  value={formData.primary_pillar}
                  onChange={(e) => handleInputChange("primary_pillar", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {pillars.map((pillar) => (
                    <option key={pillar.value} value={pillar.value} className="bg-gray-800">
                      {pillar.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Secondary Pillars</label>
              <input
                type="text"
                value={formData.secondary_pillars}
                onChange={(e) => handleInputChange("secondary_pillars", e.target.value)}
                placeholder="Comma-separated list of secondary focus areas"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Internal Notes</label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => handleInputChange("internal_notes", e.target.value)}
                placeholder="Add any internal notes about this client"
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={formData.is_portal_active}
                  onChange={(e) => handleInputChange("is_portal_active", e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                />
                Enable portal access
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {loading ? "Creating..." : "Create Client"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}