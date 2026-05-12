"use client";

import React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Box
} from "lucide-react";

export default function SoftwaresPage() {
  const softwares = [
    { id: 1, name: "Project Management Pro", category: "Productivity", rating: 4.8, status: "Active" },
    { id: 2, name: "SecureVault VPN", category: "Security", rating: 4.5, status: "Active" },
    { id: 3, name: "CloudScale Analytics", category: "Data", rating: 4.2, status: "Draft" },
    { id: 4, name: "DevFlow IDE", category: "Development", rating: 4.9, status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Softwares</h2>
          <p className="text-gray-500">Manage your software directory and reviews.</p>
        </div>
        <button className="btn btn-navy flex items-center gap-2">
          <Plus size={18} /> Add New Software
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search softwares..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Software Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Software</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {softwares.map((software) => (
                <tr key={software.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Box size={20} />
                      </div>
                      <span className="font-semibold text-gray-900">{software.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{software.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">⭐ {software.rating}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      software.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {software.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
