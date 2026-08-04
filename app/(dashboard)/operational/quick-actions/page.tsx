"use client";

import { useState } from "react";
import { Zap, UserPlus, Calendar, Mail, FilePlus } from "lucide-react";
import AddClientModal from "@/app/components/quick-actions/AddClientModal";
import AddPlatformUserModal from "@/app/components/quick-actions/AddPlatformUserModal";
import ScheduleMeetingModal from "@/app/components/quick-actions/ScheduleMeetingModal";
import SendMessageModal from "@/app/components/quick-actions/SendMessageModal";
import UploadDocumentModal from "@/app/(dashboard)/document-vault/UploadDocumentModal";
import { useLanguageStore } from "@/store/languageStore";

export default function QuickActionsPage() {
  const { t } = useLanguageStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const quickActions = [
    {
      id: "add-client",
      icon: UserPlus,
      label: t('operational.add_client'),
      description: t('operational.add_client_desc'),
      color: "bg-blue-500"
    },
    {
      id: "add-platform-user",
      icon: UserPlus,
      label: "Create Account (Client/PM/Consultant)",
      description: "Create portal user profiles with auto-generated credentials sent to email",
      color: "bg-cyan-500"
    },
    {
      id: "schedule-meeting",
      icon: Calendar,
      label: t('operational.schedule_meeting'),
      description: t('operational.schedule_meeting_desc'),
      color: "bg-purple-500"
    },
    {
      id: "send-message",
      icon: Mail,
      label: t('operational.send_message'),
      description: t('operational.send_message_desc'),
      color: "bg-orange-500"
    },
    {
      id: "upload-document",
      icon: FilePlus,
      label: t('operational.upload_document'),
      description: t('operational.upload_document_desc'),
      color: "bg-emerald-500"
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('operational.quick_actions')}</h1>
            <p className="text-gray-400">{t('operational.quick_actions_subtitle')}</p>
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
      <AddPlatformUserModal
        isOpen={activeModal === "add-platform-user"}
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
      <UploadDocumentModal
        isOpen={activeModal === "upload-document"}
        onClose={closeModal}
      />
    </div>
  );
}
