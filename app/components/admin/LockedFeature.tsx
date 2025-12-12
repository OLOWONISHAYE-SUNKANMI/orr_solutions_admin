"use client";

import { Lock } from "lucide-react";

interface LockedFeatureProps {
  title: string;
  description?: string;
  fullPage?: boolean;
}

export default function LockedFeature({ 
  title, 
  description = "This feature is not available yet",
  fullPage = false 
}: LockedFeatureProps) {
  if (fullPage) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-6 border border-white/10 shadow-2xl min-h-[600px]">
            <div className="bg-gray-500/20 w-20 h-20 rounded-full flex items-center justify-center">
              <Lock size={40} className="text-gray-400" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
              <p className="text-gray-400 text-lg">{description}</p>
            </div>
            <div className="mt-6 px-6 py-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-gray-300 text-sm">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card backdrop-blur-sm rounded-xl p-8 flex flex-col items-center justify-center gap-4 border border-white/10 min-h-[300px]">
      <div className="bg-gray-500/20 w-16 h-16 rounded-full flex items-center justify-center">
        <Lock size={32} className="text-gray-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
