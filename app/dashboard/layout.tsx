"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { ToastProvider } from "@/components/dashboard/ui/Toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<"ADMIN" | "VENDOR">("ADMIN");
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "VENDOR" || data.user?.role === "ADMIN") {
            setUserRole(data.user.role);
          }
        }
      } catch (err) {
        console.error("Failed to fetch role:", err);
      } finally {
        setLoadingRole(false);
      }
    }
    fetchRole();
  }, []);

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-muted">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
          userRole={userRole}
        />

        <div
          className={`flex min-w-0 flex-1 flex-col overflow-x-hidden transition-all duration-300 ${
            isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
          }`}
        >
          <Navbar userRole={userRole} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
