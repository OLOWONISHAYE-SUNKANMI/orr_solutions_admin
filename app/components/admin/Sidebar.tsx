"use client";

import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCheck,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../lib/hooks/auth";

type OpenState = {
  home: boolean;
  operational: boolean;
  consultation: boolean;
  tickets: boolean;
  content: boolean;
  analytics: boolean;
};

type NavItem = {
  label: string;
  href: string;
  subItems?: NavItem[];
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState<OpenState>({
    home: true,
    operational: true,
    consultation: false,
    tickets: false,
    content: false,
    analytics: false,
  });
  const [subOpen, setSubOpen] = useState<{[key: string]: boolean}>({});

  const toggle = (key: keyof OpenState) => setOpen({ ...open, [key]: !open[key] });
  const toggleSub = (key: string) => setSubOpen({ ...subOpen, [key]: !subOpen[key] });

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 h-screen bg-card text-white flex flex-col justify-between p-4 flex-shrink-0 overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed z-50`}>
        <div>
          <div className="flex items-center px-2 mb-8">
            <img src="/images/logo.svg" alt="ORR Solutions" className="w-fit h-auto" />
          </div>

          <nav className="space-y-1">
            {/* Home / Dashboard */}
            <SidebarGroup
              label="Home / Dashboard"
              icon={Home}
              open={open.home}
              onClick={() => toggle("home")}
              items={[
                { label: "Dashboard", href: "/" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />

            {/* Operational Dashboard */}
            <SidebarGroup
              label="Operational Dashboard"
              icon={Settings}
              open={open.operational}
              onClick={() => toggle("operational")}
              items={[
                { label: "Quick Actions", href: "/operational/quick-actions" },
                { label: "System Notifications", href: "/operational/system-notifications" },
                { label: "Billing & Credit Overview", href: "/operational/billing-credit" },
                { 
                  label: "Client Management", 
                  href: "/client-management",
                  subItems: [
                    { label: "All Clients", href: "/client-management" },
                    { label: "Client Profiles", href: "/client-management/profiles" },
                    { label: "Client Workspaces", href: "/client-management/workspaces" },
                    { 
                      label: "Client Meetings", 
                      href: "/client-management/meetings",
                      subItems: [
                        { label: "Past", href: "/client-management/meetings/past" },
                        { label: "Upcoming", href: "/client-management/meetings/upcoming" },
                        { label: "Pending", href: "/client-management/meetings/pending" }
                      ]
                    }
                  ]
                }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />

            {/* Consultation Management */}
            <SidebarGroup
              label="Consultation Management"
              icon={UserCheck}
              open={open.consultation}
              onClick={() => toggle("consultation")}
              items={[
                { 
                  label: "All Consultations", 
                  href: "/consultations",
                  subItems: [
                    { label: "Past Consultation Meetings", href: "/consultations/past" },
                    { label: "Scheduled Consultation Meetings", href: "/consultations/scheduled" }
                  ]
                },
                { label: "Assigned Consultants", href: "/consultations/consultants" },
                { label: "Reports (drafts/approved)", href: "/consultations/reports" },
                { 
                  label: "Meeting Management", 
                  href: "/schedule-meetings",
                  subItems: [
                    { label: "My Meetings Calendar", href: "/schedule-meetings" },
                    { label: "Requested Meetings", href: "/schedule-meetings/requested" },
                    { label: "Confirmed Meetings", href: "/schedule-meetings/confirmed" }
                  ]
                }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />

            {/* Tickets & Communication */}
            <SidebarGroup
              label="Tickets & Communication"
              icon={MessageSquare}
              open={open.tickets}
              onClick={() => toggle("tickets")}
              items={[
                { label: "All Tickets", href: "/tickets" },
                { label: "My Tickets", href: "/tickets/my-tickets" },
                { label: "Client Messages", href: "/tickets/client-messages" },
                { label: "Internal Comms", href: "/tickets/internal-comms" },
                { label: "Escalations", href: "/tickets/escalations" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />

            {/* Content Management */}
            <SidebarGroup
              label="Content Management"
              icon={FileText}
              open={open.content}
              onClick={() => toggle("content")}
              items={[
                { label: "Homepage Content", href: "/content-management" },
                { label: "How We Operate", href: "/content-management/how-we-operate" },
                { 
                  label: "Services", 
                  href: "/content-management/services",
                  subItems: [
                    { label: "Living Systems Regeneration", href: "/content-management/services/living-systems-regeneration" },
                    { label: "Operational Systems Infrastructure", href: "/content-management/services/operational-systems-infrastructure" },
                    { label: "Strategy Advisory Compliant", href: "/content-management/services/strategy-advisory-compliant" }
                  ]
                },
                { label: "Resources & Blogs", href: "/content-management/resources-blogs" },
                { label: "Legal & Policy", href: "/content-management/legal-policy" },
                { label: "Contact", href: "/content-management/contact" },
                { label: "Templates (Reports, Contracts, DS)", href: "/content-management/templates" },
                { label: "Content Drafts", href: "/content-management/drafts" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />

            {/* Analytics & Insights */}
            <SidebarGroup
              label="Analytics & Insights"
              icon={BarChart3}
              open={open.analytics}
              onClick={() => toggle("analytics")}
              items={[
                { label: "Behaviour Analytics", href: "/analytics/behaviour" },
                { label: "Sector Insights", href: "/analytics/sector" },
                { label: "Consultation Metrics", href: "/analytics/consultation-metrics" },
                { label: "Workspace Usage", href: "/analytics/workspace-usage" },
                { label: "Funnel Reports", href: "/analytics/funnel-reports" },
                { label: "Payments & Billing", href: "/analytics/payments-billing" },
                { label: "Wallet Logs", href: "/analytics/wallet-logs" },
                { label: "Pro-rata Approvals", href: "/analytics/pro-rata-approvals" },
                { label: "Subscriptions", href: "/analytics/subscriptions" },
                { label: "Invoicing", href: "/analytics/invoicing" },
                { label: "Payment Disputes", href: "/analytics/payment-disputes" }
              ]}
              pathname={pathname}
              subOpen={subOpen}
              toggleSub={toggleSub}
              onLinkClick={onClose}
            />
          </nav>
        </div>

        <div className="bg-primary text-background rounded-xl p-3 mt-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="leading-tight text-[12px] font-medium">
              {user?.username || 'Admin'}
              <div className="text-[10px] opacity-80 truncate max-w-[120px]">{user?.email || ''}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-background/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarGroup({ 
  label, 
  icon: Icon,
  open, 
  onClick, 
  items, 
  pathname,
  subOpen,
  toggleSub,
  onLinkClick
}: { 
  label: string;
  icon: any;
  open: boolean; 
  onClick: () => void; 
  items: NavItem[]; 
  pathname: string;
  subOpen: {[key: string]: boolean};
  toggleSub: (key: string) => void;
  onLinkClick: () => void;
}) {
  const isActive = items.some(item => 
    pathname === item.href || 
    item.subItems?.some(sub => 
      pathname === sub.href || 
      sub.subItems?.some(nested => pathname === nested.href)
    )
  );
  
  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition text-white ${
          isActive ? "bg-lemon text-black" : "hover:bg-primary hover:bg-opacity-20"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} />
          {label}
        </div>
        <ChevronDown size={16} className={`${open ? "rotate-180" : ""} transition`} />
      </div>

      {open && items.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {items.map((item) => (
            <NavItemComponent 
              key={item.href} 
              item={item} 
              pathname={pathname} 
              subOpen={subOpen} 
              toggleSub={toggleSub}
              onLinkClick={onLinkClick}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItemComponent({ 
  item, 
  pathname, 
  subOpen, 
  toggleSub, 
  onLinkClick,
  level 
}: { 
  item: NavItem; 
  pathname: string; 
  subOpen: {[key: string]: boolean}; 
  toggleSub: (key: string) => void;
  onLinkClick: () => void;
  level: number;
}) {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = pathname === item.href || item.subItems?.some(sub => 
    pathname === sub.href || sub.subItems?.some(nested => pathname === nested.href)
  );

  if (hasSubItems) {
    return (
      <div>
        <div className="flex items-center justify-between px-3 py-1 text-sm rounded hover:bg-primary hover:bg-opacity-10">
          <Link 
            href={item.href}
            onClick={onLinkClick}
            className={`flex-1 ${
              isActive ? "text-lemon" : "text-white"
            }`}
          >
            {item.label}
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSub(item.href);
            }}
            className="p-1 hover:bg-white/10 rounded"
          >
            {subOpen[item.href] ? 
              <ChevronDown size={14} className="transition" /> : 
              <ChevronRight size={14} className="transition" />
            }
          </button>
        </div>
        {subOpen[item.href] && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subItems!.map((subItem) => (
              <NavItemComponent 
                key={subItem.href} 
                item={subItem} 
                pathname={pathname} 
                subOpen={subOpen} 
                toggleSub={toggleSub}
                onLinkClick={onLinkClick}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link 
      href={item.href}
      onClick={onLinkClick}
      className={`block px-3 py-1 text-${level > 0 ? 'xs' : 'sm'} rounded cursor-pointer hover:bg-primary hover:bg-opacity-10 ${
        pathname === item.href ? "text-lemon" : "text-white opacity-70"
      }`}
    >
      {item.label}
    </Link>
  );
}
