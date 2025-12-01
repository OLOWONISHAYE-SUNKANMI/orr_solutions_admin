import Sidebar from "@/app/components/admin/Sidebar";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default layout;
