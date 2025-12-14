"use client";

import { Clock, TrendingUp } from "lucide-react";
import { useRole, useIsSuperAdmin } from "@/lib/rbac/hooks";

export default function WelcomeHero() {
  const role = useRole();
  const isSuperAdmin = useIsSuperAdmin();

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRoleDisplay = () => {
    if (!role) return 'Admin';
    return role.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-transparent rounded-2xl p-8 md:p-12 border border-primary/30 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Welcome back, {getRoleDisplay()}
            {isSuperAdmin && ' 👑'}
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            You're all set to manage operations and drive client success.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            <span>{formatDate()}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center w-24 h-24 bg-primary/20 rounded-full border border-primary/30">
          <TrendingUp size={48} className="text-primary" />
        </div>
      </div>
    </div>
  );
}