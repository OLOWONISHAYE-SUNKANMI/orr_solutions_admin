"use client";

import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import type { NotificationItem } from '@/lib/hooks/useNotification';

interface ToastProps {
  notification: NotificationItem;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-green-500/20 border-green-500/50 text-green-300',
  error: 'bg-red-500/20 border-red-500/50 text-red-300',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
};

export default function Toast({ notification, onRemove }: ToastProps) {
  const Icon = iconMap[notification.type];

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  return (
    <div className={`${colorMap[notification.type]} border rounded-lg p-4 mb-3 flex items-start gap-3 backdrop-blur-sm shadow-lg animate-in slide-in-from-right duration-300`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-sm">{notification.title}</p>
        {notification.message && (
          <p className="text-xs opacity-90 mt-1">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}