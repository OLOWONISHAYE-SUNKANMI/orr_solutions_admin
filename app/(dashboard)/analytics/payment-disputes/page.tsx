"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function PaymentDisputesPage() {
  return (
    <LockedFeature 
      title="Payment Disputes" 
      description="Payment dispute and chargeback management will be available soon"
      fullPage={true}
    />
  );
}
