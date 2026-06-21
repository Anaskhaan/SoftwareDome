"use client";

import React from "react";
import CustomTable from "@/components/constantComponents/CustomTable";
import { getUsers, updateUser, setUserStatus, deleteUser } from "./actions";
import AdminOutletBtnHeading from "@/components/dashboard/AdminOutletBtnHeading";
import { Edit2, Trash2, ShieldCheck, AlertCircle, Users as UsersIcon } from "@/lib/fa-icons";
import Tabs from "@/components/dashboard/ui/Tabs";
import Badge, { statusToTone } from "@/components/dashboard/ui/Badge";
import Button from "@/components/dashboard/ui/Button";
import Modal, { Drawer } from "@/components/dashboard/ui/Modal";
import FormField from "@/components/dashboard/ui/FormField";
import { Input, Select } from "@/components/dashboard/ui/Input";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/ui/Toast";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  status: string;
}

export default function UsersPage() {
  const { show } = useToast();
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [allUsers, setAllUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");

  const [editTarget, setEditTarget] = React.useState<UserRow | null>(null);
  const [editForm, setEditForm] = React.useState({ name: "", role: "USER" });
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<UserRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const result = await getUsers();
      if (result.success && result.data) {
        const mappedUsers: UserRow[] = result.data.map((user: any) => ({
          _id: user.id,
          name: user.name || "Unnamed User",
          email: user.email,
          role: user.role
            ? user.role.charAt(0) + user.role.slice(1).toLowerCase().replace(/_/g, " ")
            : "User",
          rawRole: user.role,
          status: user.status || "Active",
        }));
        setAllUsers(mappedUsers);
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

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = React.useMemo(() => {
    if (activeTab === "all") return allUsers;
    return allUsers.filter((u) => u.rawRole === activeTab.toUpperCase());
  }, [allUsers, activeTab]);

  const openEdit = (user: UserRow) => {
    setEditTarget(user);
    setEditForm({ name: user.name, role: user.rawRole });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      const result = await updateUser(editTarget._id, editForm);
      if (result.success) {
        show("User updated.", "success");
        setEditTarget(null);
        fetchUsers();
      } else {
        show(result.error || "Failed to update user.", "danger");
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserRow) => {
    setStatusUpdatingId(user._id);
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    try {
      const result = await setUserStatus(user._id, nextStatus);
      if (result.success) {
        show(`User ${nextStatus === "Suspended" ? "suspended" : "reactivated"}.`, "success");
        fetchUsers();
      } else {
        show(result.error || "Failed to update status.", "danger");
      }
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteUser(deleteTarget._id);
      if (result.success) {
        show("User deleted.", "success");
        setDeleteTarget(null);
        fetchUsers();
      } else {
        show(result.error || "Failed to delete user.", "danger");
      }
    } finally {
      setDeleting(false);
    }
  };

  const tableHeaders: any[] = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Access Level" },
    {
      key: "status",
      label: "Account Status",
      render: (value: string) => <Badge tone={statusToTone(value)}>{value}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, item: UserRow) => {
        const isSelf = item._id === currentUserId;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEdit(item)}
              className="rounded-lg p-2 text-status-info transition-colors hover:bg-status-info-bg"
              title="Edit user"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => handleToggleStatus(item)}
              disabled={statusUpdatingId === item._id || isSelf}
              className="rounded-lg p-2 text-status-warning transition-colors hover:bg-status-warning-bg disabled:opacity-30 disabled:hover:bg-transparent"
              title={isSelf ? "You can't suspend your own account" : item.status === "Suspended" ? "Reactivate user" : "Suspend user"}
            >
              <ShieldCheck size={15} />
            </button>
            <button
              onClick={() => setDeleteTarget(item)}
              disabled={isSelf}
              className="rounded-lg p-2 text-status-danger transition-colors hover:bg-status-danger-bg disabled:opacity-30 disabled:hover:bg-transparent"
              title={isSelf ? "You can't delete your own account" : "Delete user"}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminOutletBtnHeading
        heading="Users"
        subtitle="Manage admin, vendor, and standard user accounts."
        btnText="Add User"
        btnUrl="/dashboard/users/add"
      />

      <Tabs
        tabs={[
          { key: "all", label: "All", count: allUsers.length },
          { key: "admin", label: "Admins", count: allUsers.filter((u) => u.rawRole === "ADMIN").length },
          { key: "vendor", label: "Vendors", count: allUsers.filter((u) => u.rawRole === "VENDOR").length },
          { key: "user", label: "Users", count: allUsers.filter((u) => u.rawRole === "USER").length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-sunken" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger-bg p-6 text-center text-status-danger">
          <p className="mb-4">{error}</p>
          <Button variant="destructive" size="sm" onClick={fetchUsers}>
            Retry Connection
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="No accounts match this filter yet."
        />
      ) : (
        <CustomTable
          tableHeaders={tableHeaders}
          tableData={filteredUsers}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      )}

      {/* Edit drawer */}
      <Drawer open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit user">
        <form onSubmit={handleEditSubmit} className="flex h-full flex-col">
          <div className="flex-1 space-y-4">
            <FormField label="Full Name" required>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                disabled={editSubmitting}
              />
            </FormField>
            <FormField label="Access Level" required>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                disabled={editSubmitting}
              >
                <option value="USER">User</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </FormField>
            <FormField label="Email" helperText="Email cannot be changed here.">
              <Input value={editTarget?.email ?? ""} disabled />
            </FormField>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setEditTarget(null)} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={editSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete user
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger-bg text-status-danger">
            <AlertCircle size={16} />
          </div>
          <p className="text-sm text-text-muted">
            Are you sure you want to delete <span className="font-bold text-primary-navy">{deleteTarget?.name}</span>?
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
