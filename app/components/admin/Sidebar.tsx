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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
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
  // { icon: Users, label: "Client Management", active: false, value: "client-management" }, // TODO: Add API integration
  {
    icon: Ticket,
    label: "Tickets",
    active: false,
    value: "tickets",
  },
  // { icon: FileText, label: "Content Management", active: false, value: "content-management" }, // TODO: Add API integration
  {
    icon: Calendar,
    label: "Schedule Meetings",
    active: false,
    value: "schedule-meetings",
  },
  {
    icon: MessageSquare,
    label: "AI & Chat Oversight",
    active: false,
    value: "ai-oversight",
  },
  {
    icon: BarChart3,
    label: "Analytics & Reporting",
    active: false,
    value: "seo-and-analytics",
  },
  // { icon: Lock, label: "Audit & Compliance", active: false, value: "audit-logs" }, // TODO: Add API integration
  {
    icon: Bell,
    label: "Notifications",
    active: false,
    value: "notifications",
  },
  { icon: Settings2, label: "Settings", active: false, value: "settings" },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const router = useRouter();
  function handleNavigation(item: ItemType) {
    setActiveItem(item.label);
    router.push(`/admin/${item.value}`);
  }

  return (
    <div className="w-64 bg-card min-h-screen p-4">
      <div className="flex items-center gap-3 text-foreground">
        <div className="justify-start flex items-start">
          <img
            src="/images/logo.svg"
            alt="ORR Solutions"
            className="w-32 h-32 ml-10"
          />
        </div>
      </div>

      <nav className="space-y-2 text-white">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-white"
                  : "text-foreground/70 hover:bg-card hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
