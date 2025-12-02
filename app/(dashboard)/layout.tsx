import Sidebar from "@/app/components/admin/Sidebar";
import ProtectedRoute from "@/app/components/admin/ProtectedRoute";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </ProtectedRoute>
  );
}

export default layout;
