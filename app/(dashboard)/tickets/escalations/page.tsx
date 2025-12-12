"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function EscalationsPage() {
  return (
    <LockedFeature 
      title="Escalations" 
      description="High-priority issues and escalated support tickets will be available soon"
      fullPage={true}
    />
  );
}
