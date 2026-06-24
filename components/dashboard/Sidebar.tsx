"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Box,
  Store,
  UserPen,
  X,
  ChevronRight,
  LogOut,
  FileText,
  Settings,
  Calendar,
} from "@/lib/fa-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("ADMIN" | "VENDOR")[];
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "VENDOR"] },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
    subItems: [
      { label: "Users List", href: "/dashboard/users" },
      { label: "Add User", href: "/dashboard/users/add" },
    ],
  },
  {
    label: "Softwares",
    href: "/dashboard/softwares",
    icon: Box,
    roles: ["ADMIN", "VENDOR"],
    subItems: [
      { label: "Softwares List", href: "/dashboard/softwares" },
      { label: "Add Software", href: "/dashboard/softwares/add" },
    ],
  },
  {
    label: "Blogs",
    href: "/dashboard/blogs",
    icon: FileText,
    roles: ["ADMIN"],
    subItems: [
      { label: "Blogs List", href: "/dashboard/blogs" },
      { label: "Add Blog", href: "/dashboard/blogs/add" },
    ],
  },
  { label: "Vendors", href: "/dashboard/vendors", icon: Store, roles: ["ADMIN", "VENDOR"] },
  { label: "Demo Requests", href: "/dashboard/demo-requests", icon: Calendar, roles: ["ADMIN", "VENDOR"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
  { label: "Edit Profile", href: "/dashboard/edit-profile", icon: UserPen, roles: ["ADMIN", "VENDOR"] },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole: "ADMIN" | "VENDOR";
}

export default function Sidebar({
  isSidebarOpen,
  setSidebarOpen,
  isMobileOpen,
  setMobileOpen,
  userRole,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const content = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {isSidebarOpen ? (
          <Logo size="sm" variant="dark" href={null} />
        ) : (
          <Logo size="sm" variant="dark" href={null} iconOnly />
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 transition-colors hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

          return (
            <div key={item.label} className="mb-1">
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center rounded-lg px-4 py-3 transition-all ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left text-sm font-semibold">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className={`opacity-50 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`mx-2 flex items-center rounded-lg px-4 py-3 transition-all ${
                    isActive
                      ? "bg-brand-green/15 text-white shadow-sm ring-1 ring-brand-green/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {isSidebarOpen && <span className="ml-3 text-sm font-semibold">{item.label}</span>}
                </Link>
              )}

              {isSidebarOpen && hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`mx-2 flex cursor-pointer items-center rounded-lg px-4 py-2 text-sm transition-all ${
                          isSubActive
                            ? "bg-white/5 font-semibold text-brand-green-light"
                            : "text-white/40 hover:bg-white/5 hover:text-white/80"
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

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-4 py-3 text-white/60 transition-all hover:bg-status-danger/20 hover:text-white"
        >
          <LogOut size={18} className="shrink-0" />
          {isSidebarOpen && <span className="ml-3 text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 hidden flex-col bg-navy-800 text-white transition-all duration-300 ease-in-out lg:flex ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {content}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-navy-700 text-white/70 shadow-md transition-colors hover:bg-navy-600 hover:text-white lg:flex"
          aria-label="Toggle sidebar width"
        >
          <ChevronRight size={12} className={`transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile/tablet drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isMobileOpen ? "visible" : "invisible"}`}>
        <button
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-800 text-white shadow-2xl transition-transform duration-300 ease-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
