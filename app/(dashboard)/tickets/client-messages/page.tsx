"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function ClientMessagesPage() {
  return (
    <LockedFeature 
      title="Client Messages" 
      description="Direct communication with clients will be available soon"
      fullPage={true}
    />
  );
}
