"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80">
        <AlertCircle size={20} />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}