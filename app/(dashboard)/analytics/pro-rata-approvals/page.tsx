"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function ProRataApprovalsPage() {
  return (
    <LockedFeature 
      title="Pro-rata Approvals" 
      description="Pro-rated billing adjustments and refund approvals will be available soon"
      fullPage={true}
    />
  );
}
