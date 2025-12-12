"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function WorkspaceUsagePage() {
  return (
    <LockedFeature 
      title="Workspace Usage" 
      description="Client workspace activity and engagement analytics will be available soon"
      fullPage={true}
    />
  );
}
