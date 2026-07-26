"use client";

import { X, Calendar, Clock, CheckCircle } from "lucide-react";
import type { MeetingListItem } from "@/app/services/types";
import { useLanguageStore } from "@/store/languageStore";

interface ConsultantAssignmentsModalProps {
  consultantName: string;
  meetings: MeetingListItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultantAssignmentsModal({ consultantName, meetings, isOpen, onClose }: ConsultantAssignmentsModalProps) {
  const { t, language } = useLanguageStore();

  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(language === 'en' ? "en-US" : "it-IT", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return "bg-green-500/20 text-green-300 border-green-500/30";
    if (status === 'confirmed') return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (status === 'requested') return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-white/10 rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{t('consultations.assignments_for', { name: consultantName })} Assignments: {consultantName}</h2>
          <p className="text-gray-400">Total assigned meetings: {meetings.length}</p>
        </div>

        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/10">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No meetings assigned to this consultant.</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{meeting.client_name || 'Unknown Client'}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(meeting.status)}`}>
                      {(meeting.status || 'Unknown').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{meeting.client_company}</p>
                </div>

                <div className="flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={14} className="text-primary" />
                    <span>{formatDateTime(meeting.confirmed_datetime || meeting.requested_datetime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={14} className="text-primary" />
                    <span>{meeting.duration_minutes} {t('meetings.minutes')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
