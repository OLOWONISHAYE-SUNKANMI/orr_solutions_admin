"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function SubscriptionsPage() {
  return (
    <LockedFeature 
      title="Subscriptions" 
      description="Client subscriptions and plan management will be available soon"
      fullPage={true}
    />
  );
}
