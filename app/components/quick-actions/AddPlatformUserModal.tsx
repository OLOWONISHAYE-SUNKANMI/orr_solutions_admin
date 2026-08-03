"use client";

import { useState } from "react";
import { X, UserPlus, Loader, AlertCircle, CheckCircle } from "lucide-react";
import api from "@/app/services/api";

interface AddPlatformUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPlatformUserModal({ isOpen, onClose }: AddPlatformUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{username: string, email: string, password: string} | null>(null);
  const [formData, setFormData] = useState({
    role_type: "client",
    email: "",
    first_name: "",
    last_name: "",
  });

  const roles = [
    { value: "client", label: "Client" },
    { value: "pm", label: "Project Manager (PM)" },
    { value: "consultant", label: "Consultant / Specialist" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError("Please fill in all required fields: Email, First Name, and Last Name");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Submitting platform user data:', formData);
      
      const result = await api.settings.createPlatformUser(formData) as any;
      console.log('✅ Platform user created successfully:', result);
      
      const responseData = result?.data || result;
      setCreatedCredentials({
        username: responseData.username || formData.email.split('@')[0],
        email: responseData.email || formData.email,
        password: responseData.password || "Auto-Generated",
      });
      setSuccess(true);
      
    } catch (err: any) {
      console.error("❌ Failed to create platform user:", err);
      setError(err?.message || err?.error || "Failed to create user. Ensure username/email does not exist.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleClose = () => {
    setSuccess(false);
    setCreatedCredentials(null);
    setFormData({
      role_type: "client",
      email: "",
      first_name: "",
      last_name: "",
    });
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 border border-primary/30 w-10 h-10 rounded-lg flex items-center justify-center text-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Platform Account</h2>
              <p className="text-gray-400 text-sm">Create Client, PM, or Consultant accounts with auto-credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300 text-sm">Error</p>
                <p className="text-red-200 text-xs">{error}</p>
              </div>
            </div>
          )}

          {createdCredentials ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Account Created Successfully</h3>
                <p className="text-xs text-gray-400">
                  Please copy the credentials below. A welcome email has also been dispatched to the user.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Username</label>
                  <p className="text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg border border-white/5 mt-1 select-all">{createdCredentials.username}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Email Address</label>
                  <p className="text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg border border-white/5 mt-1 select-all">{createdCredentials.email}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Temporary Password</label>
                  <p className="text-sm font-mono text-emerald-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5 mt-1 select-all">{createdCredentials.password}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Username: ${createdCredentials.username}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                    alert("Credentials copied to clipboard!");
                  }}
                  className="flex-1 py-3 bg-primary hover:bg-primary/80 rounded-lg text-slate-950 font-bold transition-all duration-200 cursor-pointer"
                >
                  Copy to Clipboard
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-white">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Account Type / Role</label>
                <select
                  value={formData.role_type}
                  onChange={(e) => handleInputChange("role_type", e.target.value)}
                  className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value} className="bg-gray-800">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                  required
                />
              </div>

              <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl text-slate-400 text-xs space-y-1">
                <p className="font-bold text-slate-300">🔑 Auto-Credentials Policy</p>
                <p>Username will be auto-generated from email. A secure temporary password will be dynamically generated and instantly emailed to the user.</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-slate-950 font-bold transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
