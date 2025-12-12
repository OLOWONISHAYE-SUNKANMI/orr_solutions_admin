"use client";

import LockedFeature from "@/app/components/admin/LockedFeature";

export default function InvoicingPage() {
  return (
    <LockedFeature 
      title="Invoicing" 
      description="Invoice generation and management will be available soon"
      fullPage={true}
    />
  );
}
