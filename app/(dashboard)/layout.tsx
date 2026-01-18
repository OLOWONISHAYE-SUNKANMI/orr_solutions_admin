"use client";
import Sidebar from "@/app/components/admin/Sidebar";
import ProtectedRoute from "@/app/components/admin/ProtectedRoute";
import Header from "@/app/components/admin/Header";
import ToastContainer from "@/app/components/ui/ToastContainer";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import React, { useState } from "react";

function layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="flex flex-col md:flex-row max-h-screen relative">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className="flex-1 flex flex-col ml-0 md:ml-64">
            <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <ToastContainer />
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}

export default layout;
