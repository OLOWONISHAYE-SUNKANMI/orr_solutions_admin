"use client";

import { Clock } from "lucide-react";

export default function ProRataApprovalsPage() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="text-center py-16">
            <Clock className="mx-auto mb-6 text-blue-400" size={64} />
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Pro-rata Approvals</h1>
            <p className="text-gray-400 text-lg mb-2">Pro-rata billing adjustments and approval management will be available soon</p>
            <p className="text-gray-500 text-sm">coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
