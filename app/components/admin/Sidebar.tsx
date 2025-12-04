"use client";
import {
  Home,
  FileText,
  Ticket,
  BarChart3,
  Settings,
  LucideProps,
  Settings2,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Lock,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import { useAuthStore } from "../../../lib/hooks/auth";
type ItemType = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  active: boolean;
  value: string;
};

const navigationItems: ItemType[] = [
  { icon: Home, label: "Dashboard", active: true, value: "" },
  { icon: Users, label: "Client Management", active: false, value: "client-management" }, // TODO: Add API integration
  {
    icon: Ticket,
    label: "Tickets",
    active: false,
    value: "tickets",
  },
  { icon: FileText, label: "Content Management", active: false, value: "content-management" }, // TODO: Add API integration
  {
    icon: Calendar,
    label: "Schedule Meetings",
    active: false,
    value: "schedule-meetings",
  },
  // {
  //   icon: MessageSquare,
  //   label: "AI & Chat Oversight",
  //   active: false,
  //   value: "ai-oversight",
  // },
  {
    icon: BarChart3,
    label: "SEO & Analytics",
    active: false,
    value: "seo-and-analytics",
  },
  // { icon: Lock, label: "Audit & Compliance", active: false, value: "audit-logs" }, // TODO: Add API integration
  {
    icon: CreditCard,
    label: "Payment Management",
    active: false,
    value: "payment-management",
  },
  {
    icon: Bell,
    label: "Notifications",
    active: false,
    value: "notifications",
  },
  {
    icon: BarChart3,
    label: "Analytics & Reporting",
    active: false,
    value: "analytics-reporting",
  },
  { icon: Settings2, label: "Settings", active: false, value: "settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const router = useRouter();
  const { logout } = useAuthStore();

  function handleNavigation(item: ItemType) {
    setActiveItem(item.label);
    router.push(`/${item.value}`);
    onClose();
  }

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-card min-h-screen p-4 flex flex-col
          transform transition-transform duration-300 ease-in-out 
          ${isOpen ? 'translate-x-0 overflow-y-scroll' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-center mb-6 mt-12 md:mt-0">
          <img
            src="/images/logo.svg"
            alt="ORR Solutions"
            className="w-24 h-24"
          />
        </div>

        <nav className="space-y-2 text-white flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer text-sm ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground/70 hover:bg-card-light hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer text-foreground/70 hover:bg-card-light hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
