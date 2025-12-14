"use client";

import { Users, AlertCircle, Calendar, FileText, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import PermissionGuard from "../admin/PermissionGuard";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Add New Client",
      description: "Create a new client profile",
      icon: Users,
      color: "primary",
      onClick: () => router.push("/client-management"),
permission: "can_edit_clients" as const
    },
    {
      title: "Create Support Ticket",
      description: "Handle client support requests",
      icon: AlertCircle,
      color: "orange-500",
      onClick: () => router.push("/tickets"),
permission: "can_manage_tickets" as const
    },
    {
      title: "Schedule Meeting",
      description: "Book consultation sessions",
      icon: Calendar,
      color: "blue-500",
      onClick: () => router.push("/schedule-meetings"),
permission: "can_manage_meetings" as const
    },
    {
      title: "Create Content",
      description: "Add new resources and articles",
      icon: FileText,
      color: "green-500",
      onClick: () => router.push("/content-management/new"),
permission: "can_create_content" as const
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Plus size={18} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action) => (
          <PermissionGuard key={action.title} permissions={[action.permission]}>
            <button 
              onClick={action.onClick}
              className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-primary/30 transition-all duration-300 text-left w-full"
            >
              <action.icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{action.title}</p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </PermissionGuard>
        ))}
      </div>
    </div>
  );
}