"use client";
import Sidebar from "@/app/components/admin/Sidebar";
import ProtectedRoute from "@/app/components/admin/ProtectedRoute";
import Header from "@/app/components/admin/Header";
import React, { useState } from "react";

function layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="flex-1 w-full overflow-x-hidden flex flex-col">
          <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default layout;
