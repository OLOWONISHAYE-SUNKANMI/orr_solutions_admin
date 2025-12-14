"use client";

import { useState } from "react";
import { Zap, UserPlus, Calendar, Mail } from "lucide-react";
import AddClientModal from "@/app/components/quick-actions/AddClientModal";
import ScheduleMeetingModal from "@/app/components/quick-actions/ScheduleMeetingModal";
import SendMessageModal from "@/app/components/quick-actions/SendMessageModal";

export default function QuickActionsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const quickActions = [
    { 
      id: "add-client",
      icon: UserPlus, 
      label: "Add New Client", 
      description: "Create a new client profile",
      color: "bg-blue-500" 
    },
    { 
      id: "schedule-meeting",
      icon: Calendar, 
      label: "Schedule Meeting", 
      description: "Book a new client meeting",
      color: "bg-purple-500" 
    },
    { 
      id: "send-message",
      icon: Mail, 
      label: "Send Message", 
      description: "Create a new ticket or message",
      color: "bg-orange-500" 
    },
  ];

  const handleActionClick = (actionId: string) => {
    setActiveModal(actionId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Quick Actions</h1>
            <p className="text-gray-400">Perform common tasks quickly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all group text-left"
                >
                  <div className={`${action.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.label}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal 
        isOpen={activeModal === "add-client"} 
        onClose={closeModal} 
      />
      <ScheduleMeetingModal 
        isOpen={activeModal === "schedule-meeting"} 
        onClose={closeModal} 
      />
      <SendMessageModal 
        isOpen={activeModal === "send-message"} 
        onClose={closeModal} 
      />
    </div>
  );
}
