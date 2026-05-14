"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "VENDOR">("ADMIN"); // Mock role

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        userRole={userRole} 
      />

      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-20"}`}>
        <Navbar userRole={userRole} />

        <main className="p-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
