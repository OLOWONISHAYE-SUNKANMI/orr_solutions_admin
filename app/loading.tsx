import React from 'react';
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm font-medium text-foreground opacity-60">Loading...</p>
      </div>
    </div>
  );
}
