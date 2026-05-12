"use client";
import React from "react";
import {
  Users,
  Box,
  Store,
  TrendingUp,
  Activity,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total Softwares", value: "124", icon: Box },
    { label: "Total Vendors", value: "48", icon: Store },
    { label: "Total Users", value: "1,240", icon: Users },
    { label: "Active Sessions", value: "85", icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">Stats Overview</h2>
        <p className="text-gray-500">Welcome back, here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 flex items-center gap-4 bg-[#0a192f] text-white rounded-lg border border-white/10 hover:scale-[1.02] transition-transform">
            <div>
              <stat.icon size={24} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">{stat.label}</p>
              <h3 className="text-xl tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
