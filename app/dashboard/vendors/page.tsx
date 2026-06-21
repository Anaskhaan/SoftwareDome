"use client";

import React from "react";
import { Store, Globe, Package, MoreVertical } from "@/lib/fa-icons";

export default function VendorsPage() {
  const vendors = [
    { id: 1, name: "TechSolutions Inc.", website: "techsolutions.io", products: 12, status: "Verified" },
    { id: 2, name: "Global Softworks", website: "globalsoft.com", products: 5, status: "Verified" },
    { id: 3, name: "Innovative Apps", website: "innoapps.net", products: 8, status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">Vendors</h2>
        <p className="text-gray-500">Manage vendor profiles and partnership status.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase ">Vendor</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase ">Products</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase ">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase ">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Store size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <Globe size={10} /> {vendor.website}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Package size={14} className="text-orange-500" /> {vendor.products} Softwares
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${vendor.status === "Verified" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  <MoreVertical size={18} className="cursor-pointer hover:text-gray-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
