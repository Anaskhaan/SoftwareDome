"use client";

import React from "react";
import { Key } from "lucide-react";
import CustomTable from "@/components/constantComponents/CustomTable";

export default function UsersPage() {
  const [selectedRow, setSelectedRow] = React.useState(null);

  const tableHeaders: any[] = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Access Level" },
    { key: "status", label: "Account Status" },
    {
      key: "apiKey",
      label: "API Key",
      render: (value: string | null) => value ? (
        <code className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-mono">
          {value.substring(0, 8)}••••••••
        </code>
      ) : (
        <span className="text-slate-400 italic">No Key</span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, item: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Generating API Key for ${item.name}...`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-active/10 text-brand-active hover:bg-brand-active hover:text-white rounded-md transition-all text-xs font-semibold"
        >
          <Key size={14} />
          {item.apiKey ? "Regenerate" : "Get Key"}
        </button>
      )
    },
  ];

  const tableData = [
    { _id: "1", name: "Mashhood Rehman", email: "mashhood@softwaredome.com", role: "Super Admin", status: "Active", apiKey: "sd_live_9823hfsd8923hf" },
    { _id: "2", name: "John Smith", email: "john.s@enterprise.io", role: "Vendor", status: "Active", apiKey: null },
    { _id: "3", name: "Sarah Connor", email: "s.connor@resistance.net", role: "User", status: "Pending", apiKey: null },
    { _id: "4", name: "Alex Murphy", email: "murphy@ocp.corp", role: "Admin", status: "Inactive", apiKey: "sd_live_0000robocop" },
    { _id: "5", name: "Ellen Ripley", email: "ripley@weyland-yutani.com", role: "User", status: "Active", apiKey: null },
    { _id: "6", name: "Rick Deckard", email: "deckard@lapd.gov", role: "Admin", status: "Active", apiKey: "sd_live_nexus6hunter" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">User Management</h2>
          <p className="text-gray-500">Manage platform users, their roles, and security credentials.</p>
        </div>
        <button className="px-4 py-2 bg-[#0a192f] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
          Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <CustomTable
            tableHeaders={tableHeaders}
            tableData={tableData}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        </div>
      </div>
    </div>
  );
}
