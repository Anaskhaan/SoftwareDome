"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Box, 
  Store, 
  Settings, 
  Menu, 
  X, 
  User as UserIcon,
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("ADMIN" | "VENDOR")[];
}

const navItems: NavItem[] = [
  { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "VENDOR"] },
  { label: "Users", href: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
  { label: "Softwares", href: "/dashboard/softwares", icon: Box, roles: ["ADMIN", "VENDOR"] },
  { label: "Vendors", href: "/dashboard/vendors", icon: Store, roles: ["ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN", "VENDOR"] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "VENDOR">("ADMIN"); // Mock role
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-[#0a192f] text-white transition-all duration-300 ease-in-out flex flex-col fixed inset-y-0 z-50`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">SoftwareDome</span>}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all group ${
                  isActive 
                    ? "bg-[#112240] text-white shadow-lg" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-400" : ""} />
                {isSidebarOpen && (
                  <span className="ml-3 font-medium flex-1">{item.label}</span>
                )}
                {isSidebarOpen && isActive && <ChevronRight size={16} className="opacity-50" />}
              </Link>
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

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"}`}>
        {/* Header */}
        <header className="h-16 bg-[#0a192f] text-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-4">
            <h1 className="text-sm md:text-base font-semibold opacity-90 uppercase tracking-wider">
              {userRole} PANEL <span className="text-white/50 ml-2">[Mashhood Butt]</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                HB
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide">Hogan and Black Trading</span>
            </div>

            <div className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors border border-white/10">
              <UserIcon size={20} />
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="p-8 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
