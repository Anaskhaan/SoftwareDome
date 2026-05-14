"use client";

import React from "react";
import CustomTable from "@/components/constantComponents/CustomTable";
import { getUsers } from "./actions";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";

export default function UsersPage() {
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [tableData, setTableData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const result = await getUsers();
        if (result.success && result.data) {
          const mappedUsers = result.data.map((user: any) => ({
            _id: user.id,
            name: user.name || "Unnamed User",
            email: user.email,
            role: user.role
              ? (user.role.charAt(0) + user.role.slice(1).toLowerCase().replace(/_/g, ' '))
              : "User",
            status: user.status || "Active",
          }));
          setTableData(mappedUsers);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error in fetchUsers:", err);
        setError("An unexpected error occurred while connecting to the server.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const tableHeaders: any[] = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Access Level" },
    { key: "status", label: "Account Status" },
  ];

  return (
    <div className="space-y-6">
      <AdminOutletHeading heading="Users List" />

      <div>
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a192f]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg text-center">
              <p className="mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <CustomTable
              tableHeaders={tableHeaders}
              tableData={tableData}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
            />
          )}
        </div>
      </div>
    </div>
  );
}
