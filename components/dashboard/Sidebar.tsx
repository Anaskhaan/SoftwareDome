"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Box,
  Store,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("ADMIN" | "VENDOR")[];
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "VENDOR"] },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
    subItems: [
      { label: "Users List", href: "/dashboard/users" },
      { label: "Add User", href: "/dashboard/users/add" },
    ]
  },
  {
    label: "Softwares",
    href: "/dashboard/softwares",
    icon: Box,
    roles: ["ADMIN", "VENDOR"],
    subItems: [
      { label: "Softwares List", href: "/dashboard/softwares" },
      { label: "Add Software", href: "/dashboard/softwares/add" },
    ]
  },
  { label: "Vendors", href: "/dashboard/vendors", icon: Store, roles: ["ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN", "VENDOR"] },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: "ADMIN" | "VENDOR";
}

export default function Sidebar({ isSidebarOpen, setSidebarOpen, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`${isSidebarOpen ? "w-64" : "w-20"
        } bg-[#0a192f] text-white transition-all duration-300 ease-in-out flex flex-col fixed inset-y-0 z-50`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
        {isSidebarOpen && <span className="font-bold text-lg ">SoftwareDome</span>}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

          return (
            <div key={item.label} className="mb-1">
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`flex items-center cursor-pointer w-full px-4 py-3 mx-2 rounded-lg transition-all group ${isActive
                    ? "bg-[#112240] text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  style={{ width: "calc(100% - 16px)" }}
                >
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} opacity-50`}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all group ${isActive
                    ? "bg-[#112240] text-white shadow-lg"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {isSidebarOpen && (
                    <span className="ml-3 font-medium flex-1">{item.label}</span>
                  )}
                  {isSidebarOpen && isActive && <ChevronRight size={16} className="opacity-50" />}
                </Link>
              )}

              {isSidebarOpen && hasSubItems && isExpanded && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex cursor-pointer items-center px-4 py-2 mx-2 rounded-lg text-sm transition-all ${isSubActive
                          ? "text-blue-400 font-semibold bg-white/5"
                          : "text-white/40 hover:text-white/80 hover:bg-white/5"
                          }`}
                      >
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
