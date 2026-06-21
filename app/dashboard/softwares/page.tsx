"use client";

import React from "react";
import { Plus, Search, Filter, Edit2, Trash2, Box, AlertCircle } from "lucide-react";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { getSoftwares } from "./actions";
import Link from "next/link";

export default function SoftwaresPage() {
  const [softwares, setSoftwares] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const result = await getSoftwares();
      if (result.success) {
        setSoftwares(result.data || []);
      } else {
        setError(result.error || "Failed to load softwares");
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <AdminOutletBtnHeading heading="Softwares List" btnText="Add New Software" btnUrl="/dashboard/softwares/add" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div>
          <h2 className="text-xl font-bold text-[#0a192f]">Software Directory</h2>
          <p className="text-gray-500 text-sm">Manage your software listings and reviews.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search softwares..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Software Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0a192f] rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading softwares...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-2xl mb-3">
                <AlertCircle size={24} />
              </div>
              <p className="text-slate-900 font-semibold">{error}</p>
            </div>
          ) : softwares.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
                <Box size={24} />
              </div>
              <p className="text-slate-900 font-semibold">No softwares found</p>
              <p className="text-sm text-slate-500 mt-1">Get started by adding your first software listing.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase ">Software</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase ">Rating</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase ">Created At</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase ">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {softwares.map((software) => (
                  <tr key={software.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <Box size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{software.name}</span>
                          <span className="text-xs text-slate-500">{software.website || "No website"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-900">⭐ {software.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">
                        {new Date(software.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/softwares/edit/${software.id}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100">
                          <Edit2 size={16} />
                        </Link>
                        <button className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
