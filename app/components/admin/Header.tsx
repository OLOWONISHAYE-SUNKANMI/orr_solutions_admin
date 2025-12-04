"use client";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-card border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <img
          src="/images/logo.svg"
          alt="ORR Solutions"
          className="h-8 w-8"
        />
        <span className="text-white font-semibold text-sm">ORR Solutions</span>
      </div>
      
      <button className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors relative">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
      </button>
    </header>
  );
}
