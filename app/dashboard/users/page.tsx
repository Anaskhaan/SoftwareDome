"use client";

import React from "react";
import { User, Mail, Shield, MoreVertical } from "lucide-react";

export default function UsersPage() {
  const users = [
    { id: 1, name: "Alice Johnson", email: "alice@company.com", role: "Admin", status: "Active" },
    { id: 2, name: "Bob Smith", email: "bob@vendor.com", role: "Vendor", status: "Active" },
    { id: 3, name: "Charlie Davis", email: "charlie@user.com", role: "User", status: "Inactive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">Users</h2>
        <p className="text-gray-500">Manage platform users and their permissions.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Shield size={14} className="text-blue-500" /> {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
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
