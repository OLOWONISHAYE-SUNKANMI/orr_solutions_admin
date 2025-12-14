"use client";

import { useNotificationContext } from '@/lib/contexts/NotificationContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}