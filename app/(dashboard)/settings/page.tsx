"use client";

import { useState, useEffect } from "react";
import { Loader, Save } from "lucide-react";
import { settingsAPI } from "@/app/services";
import type { AdminRoleData, AdminUser } from "@/app/services/types";

function page() {
  const [roles, setRoles] = useState<AdminRoleData[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemSettings, setSystemSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [rolesData, usersData, systemData] = await Promise.all([
          settingsAPI.listRoles(),
          settingsAPI.listUsers(),
          settingsAPI.getSystemSettings(),
        ]);
        // Handle both array response and object with results
        setRoles(Array.isArray(rolesData) ? rolesData : ((rolesData as any).results || []));
        setUsers(Array.isArray(usersData) ? usersData : ((usersData as any).results || []));
        setSystemSettings(systemData as Record<string, any>);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSystemSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsAPI.updateSystemSettings(systemSettings);
      setSuccessMessage("System settings saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              {successMessage && <p className="text-green-400 text-sm mt-2">{successMessage}</p>}
            </div>

            <form onSubmit={handleSystemSettingsSave} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-white">General</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="siteTitle" className="text-white">Site Title</label>
                <input
                  id="siteTitle"
                  type="text"
                  value={systemSettings.site_title || ""}
                  onChange={(e) => setSystemSettings({ ...systemSettings, site_title: e.target.value })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="siteDescription" className="text-white">Site Description</label>
                <textarea 
                  id="siteDescription"
                  value={systemSettings.site_description || ""}
                  onChange={(e) => setSystemSettings({ ...systemSettings, site_description: e.target.value })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="siteLanguage" className="text-white">Site Language</label>
                <input
                  id="siteLanguage"
                  type="text"
                  value={systemSettings.site_language || ""}
                  onChange={(e) => setSystemSettings({ ...systemSettings, site_language: e.target.value })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Admin Users
              </h2>
              <div className="overflow-x-auto border border-white/10 rounded-2xl">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-primary font-semibold">Name</th>
                      <th className="text-left p-4 text-primary font-semibold">Email</th>
                      <th className="text-left p-4 text-primary font-semibold">Role</th>
                      <th className="text-left p-4 text-primary font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: AdminUser) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">{user.full_name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm">{user.email}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">{user.role_name || user.role}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${user.is_active ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-semibold text-white">
                User Roles & Permissions
              </h2>
              <div className="overflow-x-auto border border-white/10 rounded-2xl">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-primary font-semibold">Role</th>
                      <th className="text-left p-4 text-primary font-semibold">Description</th>
                      <th className="text-left p-4 text-primary font-semibold">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role: AdminRoleData) => (
                      <tr key={role.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">{role.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm">{role.description}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">{role.users_count || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Branding
              </h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="logo" className="text-white">Logo URL</label>
                <input
                  id="logo"
                  type="text"
                  value={systemSettings.logo_url || ""}
                  onChange={(e) => setSystemSettings({ ...systemSettings, logo_url: e.target.value })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="favicon" className="text-white">Favicon URL</label>
                <input
                  id="favicon"
                  type="text"
                  value={systemSettings.favicon_url || ""}
                  onChange={(e) => setSystemSettings({ ...systemSettings, favicon_url: e.target.value })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Meeting Settings
              </h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="defaultMeetingLength" className="text-white">Default Meeting Length (minutes)</label>
                <input
                  id="defaultMeetingLength"
                  type="number"
                  value={systemSettings.default_meeting_length || 60}
                  onChange={(e) => setSystemSettings({ ...systemSettings, default_meeting_length: parseInt(e.target.value) })}
                  className="bg-white/10 border border-white/20 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
