"use client";
import React from "react";
import {
  Users,
  Box,
  Store,
  Activity
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#0a192f] tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1 font-medium">System status and performance metrics summary.</p>
        </div>
        <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 flex items-center gap-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-brand-active/30 transition-all group">
            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-brand-active/5 transition-colors">
              <stat.icon size={26} className="text-[#0a192f] group-hover:text-brand-active transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions or Recent Activity could go here in the future */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 bg-[#0a192f] text-white rounded-2xl shadow-xl border border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Welcome to SoftwareDome</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              You are currently logged in as a Super Admin. You have full access to manage softwares, vendors, and user credentials.
            </p>
            <button className="px-5 py-2.5 bg-white text-[#0a192f] rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
              View Analytics
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Activity size={200} />
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-center">
          <h4 className="text-xl font-bold text-[#0a192f] mb-2">Platform Status</h4>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">API Latency</span>
              <span className="text-sm font-bold text-green-500">24ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Database Load</span>
              <span className="text-sm font-bold text-blue-500">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Server Uptime</span>
              <span className="text-sm font-bold text-slate-900">99.99%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
